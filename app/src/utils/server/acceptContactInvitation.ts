import acceptContactInvitationMutation from "../../graphql/acceptContactInvitationMutation";
import devicesForContactInvitation from "../../graphql/devicesForContactInvitation";
import { createAuthenticationToken, createContactInfoMessage } from "../device";
import { verifyDevice } from "../../utils/signing";
import claimOneTimeKeys from "../../utils/server/claimOneTimeKeys";

type Params = {
  client: any;
  device: Olm.Account;
  serverSecret: string;
  clientSecret: string;
  userId: string;
  userSigningKey: string;
  signature: string;
  inviterUserId: string;
  inviterUserSigningKey: string;
};

const acceptContactInvitation = async ({
  client,
  device,
  serverSecret,
  clientSecret,
  inviterUserId,
  inviterUserSigningKey,
  userId,
  userSigningKey,
  signature,
}: Params) => {
  const devicesForContactInvitationResult = await client
    .query(
      devicesForContactInvitation,
      {
        userId: inviterUserId,
        userSigningKey: inviterUserSigningKey,
        serverSecret,
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
    !(
      devicesForContactInvitationResult?.data?.devicesForContactInvitation &&
      devicesForContactInvitationResult?.data?.devicesForContactInvitation
        .length > 0
    )
  ) {
    throw new Error("Couln't fetch devices.");
  }

  const verifiedDevices = devicesForContactInvitationResult.data.devicesForContactInvitation.filter(
    (targetDevice: {
      idKey: string;
      signingKey: string;
      signatures: string[];
    }) => verifyDevice(targetDevice, inviterUserSigningKey)
  );

  const oneTimeKeysWithDeviceIdKey = await claimOneTimeKeys(
    client,
    device,
    verifiedDevices
  );

  const contactInfoMessages = oneTimeKeysWithDeviceIdKey.map(
    (oneTimeKeyWithDeviceIdKey) => {
      return createContactInfoMessage(
        device,
        oneTimeKeyWithDeviceIdKey.deviceIdKey,
        oneTimeKeyWithDeviceIdKey.oneTimeKey.key,
        clientSecret,
        userId,
        userSigningKey
      );
    }
  );

  if (contactInfoMessages.length === 0) {
    throw new Error("No verified devices of the contact available.");
  }

  const acceptContactInvitationMutationResult = await client
    .mutation(
      acceptContactInvitationMutation,
      {
        input: {
          userId: inviterUserId,
          userSigningKey: inviterUserSigningKey,
          serverSecret,
          signature,
          contactInfoMessage: JSON.stringify(contactInfoMessages),
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
    acceptContactInvitationMutationResult?.data?.acceptContactInvitation
      ?.contactInvitation?.id
  ) {
    return acceptContactInvitationMutationResult.data.acceptContactInvitation
      .contactInvitation.id;
  } else {
    throw new Error("Failed to accept the contact invitation.");
  }
};

export default acceptContactInvitation;
