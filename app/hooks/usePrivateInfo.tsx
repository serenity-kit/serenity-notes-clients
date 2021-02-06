import React from "react";
import * as privateInfoStore from "../utils/privateInfoStore";

type State = { type: "loading" } | { type: "privateInfo"; privateInfo: any };

export default function usePrivateInfo(): State {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    const loadPrivateInfo = async () => {
      const privateInfo = await privateInfoStore.getPrivateInfo();
      setState({ type: "privateInfo", privateInfo });
    };

    loadPrivateInfo();
    const privateInfoSubscriptionId = privateInfoStore.subscribeToPrivateInfo(
      async (privateInfo) => {
        setState({ type: "privateInfo", privateInfo });
      }
    );
    return () => {
      privateInfoStore.unsubscribeToPrivateInfo(privateInfoSubscriptionId);
    };
  }, []);

  return state;
}
