const path = require("path");
const webpack = require('webpack');
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: "./client/index.jsx",
  module: {
    rules: [
      {
        test: /.jsx?$/,
        use: {
          loader: "babel-loader"
        },
        include: path.join(__dirname, "client")
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist", "assets/js"]),
    // Ignore all locale files of moment.js
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  }
};
