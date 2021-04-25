const path = require("path");

const extraNodeModules = {
  src: path.resolve(__dirname + "/../app/src"),
};
const watchFolders = [path.resolve(__dirname + "/../app/src")];

module.exports = {
  transformer: {
    // getTransformOptions: async () => ({
    //   transform: {
    //     experimentalImportSupport: false,
    //     inlineRequires: false,
    //   },
    // }),
  },
  resolver: {
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) => {
        //redirects dependencies referenced from src/ to local node_modules
        return name in target
          ? target[name]
          : path.join(process.cwd(), `node_modules/${name}`);
      },
    }),
  },
  watchFolders,
};
