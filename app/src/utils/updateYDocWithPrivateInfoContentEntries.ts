import { base64ToUInt8Array } from "./base64";
import { Y } from "../vendor/index.js";
import { generateSigningPublicKey, verifyDevice } from "./signing";
import Olm from "./olm_legacy";
import * as deviceStore from "../stores/deviceStore";
import * as privateInfoInboundGroupSessionIdStore from "../stores/privateInfoInboundGroupSessionIdStore";
import * as privateUserSigningKeyStore from "../stores/privateUserSigningKeyStore";
import removeOneTimeKey from "./device/removeOneTimeKey";

export const updateYDocWithPrivateInfoContentEntries = async (
  yDoc: any,
  content: any,
  client: any
) => {
  const publicUserSigningKey = generateSigningPublicKey(
    await privateUserSigningKeyStore.getPrivateUserSigningKey()
  );
  // Using a for loop to avoid persistDevice running in parallel and overwritting
  // each other. We run persistDevice rather early to avoid one broken message to
  // break decrypting/affecting all others.
  for (const contentEntry of content) {
    try {
      if (!verifyDevice(contentEntry.authorDevice, publicUserSigningKey)) {
        throw new Error("Not a valid user device.");
      }

      const receivedPacket = JSON.parse(contentEntry.encryptedContent);
      if (
        receivedPacket.senderSigningKey !==
          contentEntry.authorDevice.signingKey ||
        receivedPacket.senderIdKey !== contentEntry.authorDevice.idKey
      ) {
        throw new Error("The device idKey or signingKey don't match");
      }

      const existingInboundGroupSessionId =
        await privateInfoInboundGroupSessionIdStore.getPrivateInfoInboundGroupSessionId(
          receivedPacket.senderIdKey
        );
      // no need to decrypt the already decrypted content entry and since we currently
      // always expect a new groupsession message for privateInfo updates we can check
      // it based on the groupSessionMessage id
      if (
        existingInboundGroupSessionId ===
        contentEntry.privateInfoGroupSessionMessage.id
      )
        continue;
      // set the setPrivateInfoInboundGroupSessionId as soon as possible to avoid
      // retrying on the same contentEntry again and again in case it fails
      await privateInfoInboundGroupSessionIdStore.setPrivateInfoInboundGroupSessionId(
        receivedPacket.senderIdKey,
        contentEntry.privateInfoGroupSessionMessage.id
      );

      const olmUtility = new Olm.Utility();
      // throws an error if the verification fails
      olmUtility.ed25519_verify(
        receivedPacket.senderSigningKey,
        receivedPacket.body,
        receivedPacket.signature
      );

      // always expects a new groupsession message for privateInfo updates
      const device = deviceStore.getDevice();
      const session = new Olm.Session();
      session.create_inbound(
        device,
        contentEntry.privateInfoGroupSessionMessage.body
      );
      const groupSessionInfoEncrypted = session.decrypt(
        contentEntry.privateInfoGroupSessionMessage.type,
        contentEntry.privateInfoGroupSessionMessage.body
      );

      await removeOneTimeKey({
        variant: "localAndRemote",
        message: contentEntry.privateInfoGroupSessionMessage.body,
        session,
        device,
        client,
      });

      const groupSessionInfo = JSON.parse(groupSessionInfoEncrypted);
      const inboundSession = new Olm.InboundGroupSession();
      inboundSession.create(groupSessionInfo.sessionKey);
      if (inboundSession.session_id() !== groupSessionInfo.sessionId) {
        throw new Error("Session ID missmatch");
      }

      const decryptedResult = inboundSession.decrypt(receivedPacket.body);
      if (decryptedResult.message_index !== 0) {
        // To reduce the very unlikely attack vector of a GroupSession being
        // being sucessfully attacked, the PrivateInfo always requires
        // a new GroupSession for each message. Therefor the message_index must
        // be 0.
        throw new Error("PrivateInfo message_index was not 0.");
      }
      const yState = base64ToUInt8Array(decryptedResult.plaintext);
      Y.applyUpdate(yDoc, yState);
    } catch (err) {
      // TODO show a warning to the user
      console.error("Failed to decrypt private info: ", err);
      continue;
    }
  }
};
