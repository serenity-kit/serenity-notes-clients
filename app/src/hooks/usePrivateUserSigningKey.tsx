import React from "react";
import * as store from "../stores/privateUserSigningKeyStore";

type State =
  | { type: "loading" }
  | { type: "notFound" }
  | { type: "privateUserSigningKey"; privateUserSigningKey: string };

export default function usePrivateUserSigningKey(): State {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    const loadDevice = async () => {
      const privateUserSigningKey = await store.getPrivateUserSigningKey();
      if (privateUserSigningKey) {
        setState({ type: "privateUserSigningKey", privateUserSigningKey });
      } else {
        setState({ type: "notFound" });
      }
    };

    loadDevice();
    const privateUserSigningKeySubscriptionId =
      store.subscribeToPrivateUserSigningKey(async (privateUserSigningKey) => {
        if (privateUserSigningKey) {
          setState({ type: "privateUserSigningKey", privateUserSigningKey });
        } else {
          setState({ type: "notFound" });
        }
      });
    return () => {
      store.unsubscribeToPrivateUserSigningKey(
        privateUserSigningKeySubscriptionId
      );
    };
  }, []);

  return state;
}
