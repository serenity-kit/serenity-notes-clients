import { Appearance } from "react-native";
import { DarkTheme, DefaultTheme, configureFonts } from "react-native-paper";
import { legacyColors } from "../styles/legacyColors";

const fontConfig = {
  macos: {
    regular: {
      fontFamily: "System",
      fontWeight: "400",
    },
    medium: {
      fontFamily: "System",
      fontWeight: "500",
    },
    light: {
      fontFamily: "System",
      fontWeight: "300",
    },
    thin: {
      fontFamily: "System",
      fontWeight: "100",
    },
  },
};

export const getCurrentTheme = (isDarkMode: boolean) => {
  return isDarkMode
    ? {
        ...DarkTheme,
        fonts: configureFonts(fontConfig),
        colors: {
          ...DarkTheme.colors,
          primary: legacyColors.primary,
          accent: legacyColors.textBrightest,
          backdrop: "#090909",
          background: "#121212",
        },
      }
    : {
        ...DefaultTheme,
        fonts: configureFonts(fontConfig),
        colors: {
          ...DefaultTheme.colors,
          primary: legacyColors.primary,
          accent: legacyColors.textBrightest,
          backdrop: legacyColors.background,
          background: "#fff",
        },
      };
};

export const isNativeDarkMode = () => Appearance.getColorScheme() === "dark";
