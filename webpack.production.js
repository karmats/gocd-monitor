var path = require("path");
var conf = require("./app-config");

module.exports = {
  mode: "production",
  entry: "./client/index.jsx",
  output: {
    path: path.join(__dirname, "/assets/js"),
    filename: conf.jsFilename
  },
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
  resolve: {
    extensions: [".js", ".jsx"]
  }
};
