export default {
  expo: {
    name: "Serenity",
    slug: "serenity-notes",
    privacy: "unlisted",
    platforms: ["ios", "android"],
    version: "1.6.3",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
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
      versionCode: 14,
      adaptiveIcon: {
        foregroundImage: "./assets/logo_serenity_android.png",
        backgroundColor: "#FFF",
      },
      permissions: [],
    },
    extra: {
      apiUrl: process.env.API_URL || "https://api.serenity.re/graphql",
    },
  },
};
