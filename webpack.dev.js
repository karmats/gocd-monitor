const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common");
const conf = require("./app-config");

module.exports = merge(common, {
  mode: "development",
  output: {
    path: path.join(__dirname, "dist"),
    filename: conf.jsFilename,
    publicPath: "/assets/js/"
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: conf.devPort
  }
});
