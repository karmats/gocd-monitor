var webpack = require('webpack');
var path = require('path');
var conf = require('./app-config');

module.exports = {
    entry: './client/app.jsx',
    output: {
        path: path.join(__dirname, '/assets/js'),
        filename: conf.jsFilename
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"',
                'ENABLE_DARK_THEME': conf.enableDarkTheme,
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false })
    ]
}
