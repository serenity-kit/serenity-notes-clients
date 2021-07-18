import { RepositoryUpdate } from "../types";
import { base64ToUInt8Array } from "./base64";
import { Y } from "../vendor/index.js";
import { generateSigningPublicKey, verifyDevice } from "./signing";
import fetchPrivateInfo from "./server/fetchPrivateInfo";
import Olm from "./olm_legacy";
import * as deviceStore from "./deviceStore";
import * as repositoryInboundGroupSessionsStore from "../stores/repositoryInboundGroupSessionsStore";
import * as privateInfoStore from "./privateInfoStore";
import * as privateUserSigningKeyStore from "./privateUserSigningKeyStore";
import * as userStore from "../stores/userStore";
import removeOneTimeKey from "./device/removeOneTimeKey";
import { addDebugLogEntry } from "../stores/debugStore";
import { verifySchemaVersion } from "../utils/signing";
import schemaVersion from "../utils/schemaVersion/schemaVersion";

export const extractOneTimeKeyFromMessage = (message) => {
  return message.slice(4, 47);
};

export const updateYDocWithContentEntries = async (
  yDoc: any,
  contentEntries: any,
  repositoryId: string,
  updatedAt: string | undefined,
  client: any
) => {
  const updates: RepositoryUpdate[] = [];
  const userId = (await userStore.getUser()).id;
  const publicUserSigningKey = generateSigningPublicKey(
    await privateUserSigningKeyStore.getPrivateUserSigningKey()
  );
  const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
  const yContacts = privateInfoYDoc.getMap("contacts");
  let newUpdatedAt = updatedAt;

  // TODO compare the validContentEntries with the contentEntries
  // and verify that they are euqal. In case not add issues to updates.push
  const validContentEntries: any[] = await Promise.all(
    contentEntries.filter(async (contentEntry) => {
      let validSchemaVersion = true;
      // TODO eventually should become mandatory
      if (contentEntry.schemaVersion && contentEntry.schemaVersionSignature) {
        validSchemaVersion = verifySchemaVersion(
          contentEntry.authorDevice.signingKey,
          contentEntry.schemaVersion,
          contentEntry.schemaVersionSignature
        );
      }

      if (!validSchemaVersion) {
        addDebugLogEntry(
          `Note update | schemaVersionSignature invalid`,
          "error"
        );
      }

      if (contentEntry.authorUserId === userId) {
        // NOTE For verifyDevice possibly a cross-check with privateInfo's devices
        // entry could be done, but to avoid issues with an outdated local version
        // we rely on signing instead.
        return (
          validSchemaVersion &&
          verifyDevice(contentEntry.authorDevice, publicUserSigningKey)
        );
      } else {
        // First try to see if the contact already exists in the private info
        // and use it to verify the device.
        // In case it isn't the contact might have been recently added via
        // another device. That's where we need to refetch the privateInfo and try again.
        const yContact = yContacts.get(contentEntry.authorUserId);
        const contactSigningKey = yContact.get("userSigningKey");
        if (contactSigningKey) {
          return (
            validSchemaVersion &&
            verifyDevice(contentEntry.authorDevice, contactSigningKey)
          );
        } else {
          const device = await deviceStore.getDevice();
          await fetchPrivateInfo(client, device);
          const contactSigningKey = yContact.get("userSigningKey");
          if (!contactSigningKey) return false;
          return (
            validSchemaVersion &&
            verifyDevice(contentEntry.authorDevice, contactSigningKey)
          );
        }
      }
    })
  );

  const contentEntryWithNewerSchemaVersion = validContentEntries.find(
    (contentEntry) => {
      // TODO eventually should become mandatory
      if (contentEntry.schemaVersion && contentEntry.schemaVersionSignature) {
        if (contentEntry.schemaVersion > schemaVersion) {
          addDebugLogEntry("Note update | update has newer schemaVersion");
          return true;
        }
        return false;
      }
      return false;
    }
  );

  if (contentEntryWithNewerSchemaVersion) {
    return {
      notAppliedUpdatesIncludeNewerSchemaVersion: true,
    };
  }

  // Using a for loop to avoid persistDevice running in parallel and overwritting
  // each other. We run persistDevice rather early to avoid one broken message to
  // break decrypting/affecting all others.
  for (const contentEntry of validContentEntries) {
    try {
      addDebugLogEntry(`Note update | start: ${JSON.stringify(contentEntry)}`);
      // initial value which is used in case there is no existing inboundGroupSession
      let currentMessageIndex = -1;
      const inboundGroupSessions =
        await repositoryInboundGroupSessionsStore.getRepositoryInboundGroupSesssions(
          repositoryId
        );
      const receivedPacket = JSON.parse(contentEntry.encryptedContent);

      if (
        receivedPacket.senderSigningKey !==
          contentEntry.authorDevice.signingKey ||
        receivedPacket.senderIdKey !== contentEntry.authorDevice.idKey
      ) {
        throw new Error("The device idKey or signingKey don't match");
      }

      addDebugLogEntry("Note update | verify package");
      const olmUtility = new Olm.Utility();
      // throws an error if the verification fails
      olmUtility.ed25519_verify(
        receivedPacket.senderSigningKey,
        receivedPacket.body,
        receivedPacket.signature
      );

      const inboundSession = new Olm.InboundGroupSession();
      // Unpickle an existing session if available, otherwise decrypt the
      // inboundGroupSession message.
      // This is necessary since the oneTimeKey for decrypting the
      // inboundGroupSession message already has been used and removed.
      if (
        inboundGroupSessions[receivedPacket.senderIdKey] &&
        inboundGroupSessions[receivedPacket.senderIdKey].sessionId ===
          receivedPacket.sessionId
      ) {
        addDebugLogEntry("Note update | restore existing inboundGroupSessions");
        inboundSession.unpickle(
          deviceStore.pickleKey,
          inboundGroupSessions[receivedPacket.senderIdKey].pickledSession
        );
        currentMessageIndex =
          inboundGroupSessions[receivedPacket.senderIdKey].messageIndex;
      } else {
        addDebugLogEntry("Note update | create new inboundGroupSessions");
        const device = await deviceStore.getDevice();
        const session = new Olm.Session();
        session.create_inbound(device, contentEntry.groupSessionMessage.body);
        const groupSessionInfoEncrypted = session.decrypt(
          contentEntry.groupSessionMessage.type,
          contentEntry.groupSessionMessage.body
        );

        await removeOneTimeKey({
          variant: "localAndRemote",
          message: contentEntry.groupSessionMessage.body,
          session,
          device,
          client,
        });

        const groupSessionInfo = JSON.parse(groupSessionInfoEncrypted);
        inboundSession.create(groupSessionInfo.sessionKey);
        if (inboundSession.session_id() !== groupSessionInfo.sessionId) {
          throw new Error("Session ID missmatch");
        }
        inboundGroupSessions[receivedPacket.senderIdKey] = {
          sessionId: receivedPacket.sessionId,
          pickledSession: inboundSession.pickle(deviceStore.pickleKey),
        };
        await repositoryInboundGroupSessionsStore.setRepositoryInboundGroupSesssions(
          repositoryId,
          inboundGroupSessions
        );
      }

      addDebugLogEntry("Note update | decrypt");
      const decryptedResult = inboundSession.decrypt(receivedPacket.body);
      if (decryptedResult.message_index <= currentMessageIndex) {
        throw new Error("Possible replay attack due incorrect message index.");
      }

      // It's important that messages are decrypted serially to avoid multiple
      // decryptions of the same repository to overwrite each other.
      inboundGroupSessions[receivedPacket.senderIdKey] = {
        ...inboundGroupSessions[receivedPacket.senderIdKey],
        // update the message index for the check on replay attacks in the next
        // message to decrypt with the exact same message_index
        messageIndex: decryptedResult.message_index,
      };
      await repositoryInboundGroupSessionsStore.setRepositoryInboundGroupSesssions(
        repositoryId,
        inboundGroupSessions
      );

      let yState: Uint8Array;
      let updatedAtFromMessage;
      try {
        // protocol after 2020-02-04 / 1.4.0 with a JSON object including updatedAt
        const messageObject = JSON.parse(decryptedResult.plaintext);
        yState = base64ToUInt8Array(messageObject.content);
        // TODO remove receivedPacket.updatedAt in the future when the migration to messageObject.updatedAt had been successful
        updatedAtFromMessage =
          messageObject.updatedAt || receivedPacket.updatedAt;
      } catch (err) {
        // TODO deprecate once every version <1.3.0 is unused
        yState = base64ToUInt8Array(decryptedResult.plaintext);
        // TODO remove receivedPacket.updatedAt in the future when the migration to messageObject.updatedAt had been successful
        updatedAtFromMessage = receivedPacket.updatedAt;
      }
      const serializedNoteBeforeUpdate = yDoc
        .getXmlFragment("document")
        .toString();
      Y.applyUpdate(yDoc, yState);
      const serializedNoteAfterUpdate = yDoc
        .getXmlFragment("document")
        .toString();

      if (!newUpdatedAt) {
        newUpdatedAt = updatedAtFromMessage;
      } else if (
        serializedNoteBeforeUpdate !== serializedNoteAfterUpdate &&
        new Date(newUpdatedAt) < new Date(updatedAtFromMessage)
      ) {
        // a safety mechanism to avoid that clients with a broken time
        // create a updatedAt entry in the future
        if (new Date(updatedAtFromMessage) < new Date(contentEntry.createdAt)) {
          newUpdatedAt = updatedAtFromMessage;
        } else {
          newUpdatedAt = contentEntry.createdAt;
        }
      }

      addDebugLogEntry("Note update | success");
      updates.push({
        type: "success",
        contentId: contentEntry.id,
        createdAt: contentEntry.createdAt,
        authorDeviceKey: receivedPacket.senderIdKey,
      });
    } catch (err) {
      console.error("Failed to decrypt a repository update:", err);
      addDebugLogEntry(`Note update failed: ${err}`, "error");
      const receivedPacket = JSON.parse(contentEntry.encryptedContent);
      updates.push({
        type: "failed",
        contentId: contentEntry.id,
        createdAt: contentEntry.createdAt,
        authorDeviceKey: receivedPacket.senderIdKey,
      });
    }
  }
  return { updates, updatedAt: newUpdatedAt };
};
