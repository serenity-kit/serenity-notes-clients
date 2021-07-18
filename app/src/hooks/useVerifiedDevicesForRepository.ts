import React from "react";
import { useClient } from "urql";
import useDevice from "./useDevice";
import useUser from "./useUser";
import verifiedDevicesForRepository from "../hooks/useSyncUtils/verifiedDevicesForRepository";
import * as repositoryStore from "../stores/repositoryStore";

type State =
  | { type: "loading" }
  | { type: "error" }
  | { type: "result"; devices: any[] };

const useVerifiedDevicesForRepository = (
  repositoryId: string,
  navigation?: any // optional
): State => {
  const client = useClient();
  const deviceResult = useDevice();
  const userResult = useUser();
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    async function fetchDevices() {
      if (deviceResult.type !== "device" || userResult.type !== "user") return;

      try {
        const repository = await repositoryStore.getRepository(repositoryId);
        const { verifiedDevices } = await verifiedDevicesForRepository(
          client,
          repository.serverId,
          [], // only needed for the update repository use-case to determine if the groupSession must be renewed
          deviceResult.device
        );
        setState({ type: "result", devices: verifiedDevices });
      } catch (err) {
        setState({ type: "error" });
      }
    }

    const unsubscribeNavigationFocus = navigation.addListener("focus", () => {
      fetchDevices();
    });
    fetchDevices();

    return () => {
      unsubscribeNavigationFocus();
    };
  }, [repositoryId, deviceResult.type, userResult.type, navigation]);

  return state;
};

export default useVerifiedDevicesForRepository;
