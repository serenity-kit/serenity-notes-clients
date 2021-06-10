export default {
  expo: {
    name: "Serenity",
    slug: "serenity-notes",
    privacy: "unlisted",
    platforms: ["ios", "android"],
    version: "1.6.6",
    orientation: "portrait",
    icon: "./src/assets/icon.png",
    splash: {
      image: "./src/assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FFF",
    },
    updates: {
      // disable over-the-air JS updates https://docs.expo.io/guides/configuring-ota-updates/#disabling-updates
      enabled: false,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "re.serenity.notes",
      supportsTablet: true,
      // "buildNumber": "1.0.0"
    },
    android: {
      package: "re.serenity.notes",
      versionCode: 17,
      adaptiveIcon: {
        foregroundImage: "./src/assets/logo_serenity_android.png",
        backgroundColor: "#FFF",
      },
      permissions: [],
    },
    extra: {
      apiUrl: process.env.API_URL || "https://api.serenity.re/graphql",
    },
  },
};
