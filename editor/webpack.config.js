const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    prosemirror: "./prosemirror",
  },
  output: {
    globalObject: "self",
    path: path.resolve(__dirname, "./dist/"),
    filename: "[name].bundle.js",
    publicPath: "/prosemirror/dist/",
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    publicPath: "/",
    disableHostCheck: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Serenity Editor",
      template: "template.html",
      filename: "index.html",
      inlineSource: ".(js|css)$", // embed all javascript and css inline
      isDesktop: "false",
    }),
    new HtmlWebpackPlugin({
      title: "Serenity Editor",
      template: "template.html",
      filename: "index-desktop.html",
      inlineSource: ".(js|css)$", // embed all javascript and css inline
      isDesktop: "true",
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
};
