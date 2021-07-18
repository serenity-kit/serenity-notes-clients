import React from "react";
import * as deviceStore from "../stores/deviceStore";

type State =
  | { type: "loading" }
  | { type: "notFound" }
  | { type: "device"; device: Olm.Account };

export default function useDevice(): State {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    const hasExistingDevice = deviceStore.hasDevice();
    if (hasExistingDevice) {
      const device = deviceStore.getDevice();
      setState({ type: "device", device });
    } else {
      setState({ type: "notFound" });
    }

    const deviceSubscriptionId = deviceStore.subscribeToDevice((device) => {
      if (device) {
        setState({ type: "device", device });
      } else {
        setState({ type: "notFound" });
      }
    });
    return () => {
      deviceStore.unsubscribeToDevice(deviceSubscriptionId);
    };
  }, []);

  return state;
}
