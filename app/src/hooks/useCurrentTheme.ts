import { useMemo, } from "react";
import { useColorScheme } from "react-native-appearance";
import { getCurrentTheme } from "../utils/theme";

function useCurrentTheme() {
  const colorScheme = useColorScheme();

  return useMemo(() => getCurrentTheme(colorScheme === "dark"), [colorScheme]);
}

export type DerivedTheme = ReturnType<typeof useCurrentTheme>;

export default useCurrentTheme;