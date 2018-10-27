import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import Logger from '../server/utils/Logger';
import config from '../webpack.config.dev';
import * as conf from '../app-config';

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen(conf.devPort, 'localhost', function (err, result) {
  if (err) {
    Logger.error(err);
  }

  Logger.debug('Listening at localhost:' + conf.devPort);
});
