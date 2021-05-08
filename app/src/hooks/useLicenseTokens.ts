import React from "react";
import * as licenseTokensStore from "../stores/licenseTokensStore";
import { LicenseToken } from "../types";

type State =
  | { type: "loading" }
  | { type: "licenseTokens"; licenseTokens: LicenseToken[] };

export default function useLicenseTokens(): State {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    const loadLicenseTokens = async () => {
      const licenseTokens = await licenseTokensStore.getLicenseTokens();
      setState({ type: "licenseTokens", licenseTokens });
    };

    loadLicenseTokens();
    const subscriptionId = licenseTokensStore.subscribeToLicenseTokens(
      async (licenseTokens) => {
        setState({ type: "licenseTokens", licenseTokens });
      }
    );
    return () => {
      licenseTokensStore.unsubscribeToLicenseTokens(subscriptionId);
    };
  }, []);

  return state;
}
