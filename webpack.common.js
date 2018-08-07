var path = require('path');
var webpack = require('webpack');
var WebpackAssetsManifest = require('webpack-assets-manifest');

module.exports = {
    context: path.join(__dirname, '/app/source'),
    entry: {
        main: './main/mainEntry',
    },
    output: {
        path: path.join(__dirname, '/public'),
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.sass'],
        modules: [
            path.join(__dirname, '../src'),
            'node_modules'
        ],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                type: 'javascript/auto',
                test: /\.json$/,
                include: [
                    path.resolve(__dirname, "resources/localization")
                ],
                use: [{
                    loader: 'bundle-loader',
                    options: {
                        lazy: true,
                        name: '[name]'
                    }
                }, 'json-loader']
            }]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false,
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        },
        runtimeChunk: {
            name: "manifest",
        }
    },
    plugins: [
        new WebpackAssetsManifest({
            output: '../manifest.json'
        })
    ]
}