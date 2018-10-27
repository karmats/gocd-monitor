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
        rules: [
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
    optimization: {
        minimize: false
    },
    plugins: [
        new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
}
