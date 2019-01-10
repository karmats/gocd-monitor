const path = require("path");
const webpack = require('webpack');
const conf = require("./app-config");
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
    new webpack.DefinePlugin({
      "process.env": {
        GO_SERVER_URL: `'${conf.goServerUrl}'`,
        ENABLE_DARK_THEME: conf.enableDarkTheme,
        SWITCH_BETWEEN_PAGES_INTERVAL: conf.switchBetweenPagesInterval,
        SHOW_BUILD_LABELS: conf.showBuildLabels,
        LINK_TO_PIPELINE_IN_GO: conf.linkToPipelineInGo,
        HIDE_WEATHER_ICONS: conf.hideWeatherIcons
      }
    }),
    // Ignore all locale files of moment.js
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  }
};
