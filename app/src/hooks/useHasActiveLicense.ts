import useLicenseTokens from "./useLicenseTokens";

type State =
  | { type: "loading" }
  | { type: "loaded"; hasActiveLicense: boolean };

export default function useHasActiveLicense(): State {
  const licenseTokens = useLicenseTokens();

  if (licenseTokens.type === "loading") return { type: "loading" };

  return {
    type: "loaded",
    hasActiveLicense: licenseTokens.licenseTokens.some(
      (licenseToken) => licenseToken.isActive
    ),
  };
}
