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

    // NOTE: The currentDevice is storred in the module instead of React's state or context
    // This can cause issue for hot-reloading while editing the deviceStore file.
    // Steps to reproduce:
    // 1. Open the contacts screen
    // 2. Change the deviceStore file
    // -> The useDevice hook will run, but not find device since the deviceStore module
    // is empty at the moment.
    // Fix: In this case just restart the App or change the contacts screen file to trigger
    // a reload there.
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
