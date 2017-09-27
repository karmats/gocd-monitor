var path = require('path');
var webpack = require('webpack');
var conf = require('./app-config');

module.exports = {
  devtool: 'eval',
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:' + conf.devPort,
    'webpack/hot/only-dev-server',
    './client/app.jsx'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: conf.jsFilename,
    publicPath: '/assets/js/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [{
      test: /.jsx?$/,
      use: ['babel-loader'],
      include: path.join(__dirname, 'client')
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
}
