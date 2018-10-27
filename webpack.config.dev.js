var path = require('path');
var webpack = require('webpack');
var conf = require('./app-config');

module.exports = {
  mode: 'development',
  entry: [
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
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3000
  },
  module: {
    rules: [{
      test: /.jsx?$/,
      use: {
        loader: 'babel-loader'
      },
      include: path.join(__dirname, 'client')
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
}
