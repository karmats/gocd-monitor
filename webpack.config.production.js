var webpack = require('webpack');
var path = require('path');
var conf = require('./app-config');

module.exports = {
    entry: './client/app.jsx',
    output: {
        path: __dirname + '/assets/js',
        filename: conf.jsFilename
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    ]
}
