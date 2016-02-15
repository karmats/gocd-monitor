var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');


module.exports = {
    devtool: debug ? "inline-sourcemap" : null,
    entry: './client/app.jsx',
    output: {
        path: __dirname + '/assets/js',
        filename: "main.min.js"
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
        extensions: ['', '.js', '.jsx']
    },
    plugins: debug ? [] : [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    ],
}
