let path = require('path');
let webpack = require('webpack');
let conf = require('./app-config').config;

module.exports = {
  devtool: 'eval',
  entry: [
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
    loaders: [{
      test: /.jsx?$/,
      loaders: ['react-hot', 'babel', 'json'],
      include: path.join(__dirname, 'client')
    },
    {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
}
