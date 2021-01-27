const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const conf = require("./app-config");

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.join(__dirname, "/assets/js"),
    filename: conf.jsFilename
  }
});
