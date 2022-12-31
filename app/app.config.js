export default {
  expo: {
    name: "Serenity Notes",
    slug: "serenity-notes",
    privacy: "unlisted",
    platforms: ["ios", "android"],
    version: "1.8.7",
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
      versionCode: 28,
      adaptiveIcon: {
        foregroundImage: "./src/assets/logo_serenity_android.png",
        backgroundColor: "#FFF",
      },
      permissions: [],
    },
    extra: {
      apiUrl: process.env.API_URL || "https://api.serenity.re/graphql",
      eas: {
        projectId: "2eb96ed0-d00b-47ff-9991-914538bc1fce",
      },
    },
  },
};
