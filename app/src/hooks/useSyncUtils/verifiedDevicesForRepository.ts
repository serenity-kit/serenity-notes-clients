import repositoryDevices from "../../graphql/repositoryDevices";
import { createAuthenticationToken } from "../../utils/device";
import { generateSigningPublicKey, verifyDevice } from "../../utils/signing";
import { DeviceKeys } from "../../types";
import * as privateUserSigningKeyStore from "../../utils/privateUserSigningKeyStore";
import * as userStore from "../../stores/userStore";
import * as privateInfoStore from "../../utils/privateInfoStore";
import fetchPrivateInfo from "../../utils/server/fetchPrivateInfo";

const verifiedDevicesForRepository = async (
  client: any,
  repositoryServerId: string,
  groupSessionMessageIds: string[],
  device: Olm.Account
) => {
  // TODO can be parallelized with the repositoryDevices query or even fetched in the
  // same network request
  await fetchPrivateInfo(client, device);

  const result = await client
    .query(
      repositoryDevices,
      { repositoryId: repositoryServerId, groupSessionMessageIds },
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

  const privateUserSigningKey =
    await privateUserSigningKeyStore.getPrivateUserSigningKey();
  const user = await userStore.getUser();
  const privateInfo = await privateInfoStore.getPrivateInfo();

  const verifiedDevices: DeviceKeys[] = [];

  if (result?.data?.repositoryDevices?.devices) {
    const publicUserSigningKey = generateSigningPublicKey(
      privateUserSigningKey
    );
    result.data.repositoryDevices.devices.forEach((device) => {
      if (device.userId === user.id) {
        // check for the current user's devices
        if (verifyDevice(device, publicUserSigningKey)) {
          verifiedDevices.push({ ...device });
        } else {
          console.error("Unverified user device on the server!");
        }
      } else {
        // check for the devices of the user's contacts
        const yContacts = privateInfo.getMap("contacts");
        if (yContacts.has(device.userId)) {
          const yContact = yContacts.get(device.userId);
          if (verifyDevice(device, yContact.get("userSigningKey"))) {
            verifiedDevices.push({ ...device });
          } else {
            console.error("Unverified contact device coming from the server!");
          }
        }
      }
    });
  } else {
    throw new Error("Failed to fetch verified devices for the repository.");
  }

  return {
    verifiedDevices,
    newGroupSessionNeeded:
      !result.data.repositoryDevices.groupSessionMessageIdsMatchTargetDevices,
  };
};

export default verifiedDevicesForRepository;
