# Serenity Notes iOS/Android

End-to-end encrypted collaborative notes app

[https://www.serenity.re/en/notes](https://www.serenity.re/en/notes)

## Setup & Development

```sh
npm i -g expo-cli

cd editor
yarn
# builds a index.html and copies it to app and desktop assets
yarn dist
cd ..

cd yjs
yarn
yarn dist
cd ..

# iOS/Android
cd app
yarn
# replace the API_URL in package.json with https://api.serenity.re/graphql
yarn start

# macOS
cd desktop
cd macos
npx pod-install
cd ..
# replace the API_URL in .env.development with https://api.serenity.re/graphql
npx react-native run-macos
```

## macOS Release

Bump version in app.json & in Xcode in Target `serenity-macOS`.

Change build configuration to release https://reactnative.dev/docs/publishing-to-app-store#2-configure-release-scheme

```sh
cd desktop
yarn build-macos
```

Locate the .app file in `~/Library/Developer/Xcode/DerivedData/<serenity>/Build/Products/Release` and package it as dmg: `yarn create-dmg Serenity\ Notes.app`

## License

Copyright 2021 Nikolaus Graf

Licensed under the [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.html)
