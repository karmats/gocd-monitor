var path = require('path');
var conf = require('./app-config');

module.exports = {
  mode: 'development',
  entry: [
    './client/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: conf.jsFilename,
    publicPath: '/assets/js/'
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
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: conf.devPort
  }
}
