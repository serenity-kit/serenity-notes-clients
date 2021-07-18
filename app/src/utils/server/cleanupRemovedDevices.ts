import allDeviceTombstones from "../../graphql/allDeviceTombstones";
import * as privateInfoStore from "../../stores/privateInfoStore";
import { createAuthenticationToken } from "../device";
import { Y } from "../../vendor/index.js";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import deepEqualEs6 from "fast-deep-equal/es6";

const cleanupRemovedDevices = async (
  client: any,
  device: Olm.Account,
  fetchMyVerifiedDevices: any
) => {
  const result = await client
    .query(
      allDeviceTombstones,
      {},
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

  if (result?.data?.allDeviceTombstones) {
    const yDocPrivateInfo = await privateInfoStore.getPrivateInfo();
    const yDocStateBeforeUpdate = Y.encodeStateAsUpdate(yDocPrivateInfo);
    const yLinkedDevices = yDocPrivateInfo.getMap("linkedDevices");
    result.data.allDeviceTombstones.forEach((tombstone) => {
      yLinkedDevices.delete(tombstone.idKey);
    });
    const yDocStateAfterUpdate = Y.encodeStateAsUpdate(yDocPrivateInfo);

    if (!deepEqualEs6(yDocStateBeforeUpdate, yDocStateAfterUpdate)) {
      const verifiedDevices = await fetchMyVerifiedDevices();
      await updatePrivateInfo(yDocPrivateInfo, client, device, verifiedDevices);
      await privateInfoStore.setPrivateInfo(yDocPrivateInfo);
    }
  } else {
    throw new Error("Failed to cleanup removed devices.");
  }
};

export default cleanupRemovedDevices;
