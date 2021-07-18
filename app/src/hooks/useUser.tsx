import React from "react";
import * as userStore from "../stores/userStore";
import { User } from "../types";

type State =
  | { type: "loading" }
  | { type: "notFound" }
  | { type: "user"; user: User };

export default function useUser(): State {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    const loadDevice = async () => {
      const user = await userStore.getUser();
      if (user) {
        setState({ type: "user", user });
      } else {
        setState({ type: "notFound" });
      }
    };

    loadDevice();
    const userSubscriptionId = userStore.subscribeToUser(async (user) => {
      if (user) {
        setState({ type: "user", user });
      } else {
        setState({ type: "notFound" });
      }
    });
    return () => {
      userStore.unsubscribeToUser(userSubscriptionId);
    };
  }, []);

  return state;
}
