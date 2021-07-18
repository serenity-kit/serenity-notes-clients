import { Y } from "../../vendor/index.js";
import completeContactInvitationMutation from "../../graphql/completeContactInvitationMutation";
import * as privateInfoStore from "../../utils/privateInfoStore";
import * as privateUserSigningKeyStore from "../../stores/privateUserSigningKeyStore";
import {
  createAuthenticationToken,
  decryptContactInfoMessage,
  getIdentityKeys,
} from "../device";
import { signContactUserKey } from "../../utils/signing";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";

const completeContactInvitation = async (
  contactInvitation: {
    id: string;
    contactInfoMessage: string;
  },
  client: any,
  device: Olm.Account,
  fetchMyVerifiedDevices: any
) => {
  const receivedContactInfoMessages = JSON.parse(
    contactInvitation.contactInfoMessage
  );

  const decryptedContactInfoMessage = await decryptContactInfoMessage(
    receivedContactInfoMessages.find(
      (entry: any) => entry.deviceIdKey === getIdentityKeys(device).idKey
    ).encryptedMessage,
    device
  );

  const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
  const yContactInvitations = privateInfoYDoc.getMap("contactInvitations");
  const yContactInvitation = yContactInvitations.get(contactInvitation.id);
  if (!yContactInvitation) {
    throw new Error("Missing ContactInvitation in privateInfoStore");
  }

  if (
    decryptedContactInfoMessage.clientSecret !==
    yContactInvitation.get("clientSecret")
  ) {
    throw new Error("ContactInvitation secrets don't match up.");
  }

  const privateUserSigningKey =
    await privateUserSigningKeyStore.getPrivateUserSigningKey();

  const signature = signContactUserKey(
    privateUserSigningKey,
    decryptedContactInfoMessage.userSigningKey
  );

  const result = await client
    .mutation(
      completeContactInvitationMutation,
      {
        input: {
          contactInvitationId: contactInvitation.id,
          userSigningKey: decryptedContactInfoMessage.userSigningKey,
          signature,
          userId: decryptedContactInfoMessage.userId,
        },
      },
      {
        fetchOptions: {
          headers: {
            authorization: `signed-utc-msg ${createAuthenticationToken(
              device
            )}`,
          },
        },
      }
    )
    .toPromise();

  if (
    result?.data?.completeContactInvitation?.contactInvitation?.status ===
    "COMPLETED"
  ) {
    const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
    const yContacts = privateInfoYDoc.getMap("contacts");
    const contact = yContacts.get(decryptedContactInfoMessage.userId);
    const newContact = contact ? contact : new Y.Map();
    newContact.set("name", yContactInvitation.get("name"));
    newContact.set(
      "userSigningKey",
      decryptedContactInfoMessage.userSigningKey
    );
    yContacts.set(decryptedContactInfoMessage.userId, newContact);
    const yContactInvitations = privateInfoYDoc.getMap("contactInvitations");
    yContactInvitations.delete(contactInvitation.id);

    const verifiedDevices = await fetchMyVerifiedDevices();
    await updatePrivateInfo(privateInfoYDoc, client, device, verifiedDevices);
    await privateInfoStore.setPrivateInfo(privateInfoYDoc);
    return result.data.completeContactInvitation.contactInvitation.id;
  } else {
    throw new Error("Failed to complete server mutation.");
  }
};

export default completeContactInvitation;
