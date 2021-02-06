import privateInfoQuery from "../../graphql/privateInfo";
import { createAuthenticationToken } from "../device";
import { updateYDocWithPrivateInfoContentEntries } from "../updateYDocWithPrivateInfoContentEntries";
import * as privateInfoStore from "../privateInfoStore";
import { Y } from "../../vendor/index.js";
import deepEqualEs6 from "fast-deep-equal/es6";

const fetchPrivateInfo = async (client: any, device: Olm.Account) => {
  const result = await client
    .query(
      privateInfoQuery,
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

  if (result?.data?.privateInfo?.privateInfoContent) {
    const yDocPrivateInfo = await privateInfoStore.getPrivateInfo();
    const stateVectorBeforeUpdate = Y.encodeStateVector(yDocPrivateInfo);
    await updateYDocWithPrivateInfoContentEntries(
      yDocPrivateInfo,
      result.data.privateInfo.privateInfoContent,
      client
    );
    const stateVectorAfterUpdate = Y.encodeStateVector(yDocPrivateInfo);
    if (!deepEqualEs6(stateVectorBeforeUpdate, stateVectorAfterUpdate)) {
      await privateInfoStore.setPrivateInfo(yDocPrivateInfo);
    }
  } else {
    console.error("Failed:", result);
    throw new Error("Failed to load private info");
  }
};

export default fetchPrivateInfo;
