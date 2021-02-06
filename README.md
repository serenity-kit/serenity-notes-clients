# Serenity Notes iOS/Android

End-to-end encrypted collaborative notes app

(https://www.serenity.re/en/notes)[https://www.serenity.re/en/notes]

## Setup & Development

```sh
npm i -g expo-cli

cd editor
yarn
yarn dist
cd ..

cd yjs
yarn
yarn dist
cd ..

cd app
yarn
# replace the API_URL in package.json with https://api.serenity.re/graphql
yarn start
```

## License

Copyright 2021 Nikolaus Graf

Licensed under the [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.html)
