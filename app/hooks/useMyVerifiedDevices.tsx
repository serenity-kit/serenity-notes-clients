import { useClient } from "urql";
import useDevice from "./useDevice";
import usePrivateUserSigningKey from "./usePrivateUserSigningKey";
import fetchMyVerifiedDevices from "../utils/server/fetchMyVerifiedDevices";

const useMyVerifiedDevices = () => {
  const client = useClient();
  // Use the hooks to make sure it triggers a re-render, but then we use the latest store version in fetchMyVerifiedDevices due some re-render issues where fetchMyVerifiedDevices is not up to date (namely completeContactInvitation)
  useDevice();
  usePrivateUserSigningKey();

  const fetchMyVerifiedDevicesWithClient = () => fetchMyVerifiedDevices(client);
  return fetchMyVerifiedDevicesWithClient;
};

export default useMyVerifiedDevices;
