var webpack = require('webpack');
var WebpackChunkHash = require("webpack-chunk-hash");
const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(commonConfig, {
    mode: 'production',
    output: {
        filename: 'js/[name]-bundle.[chunkhash].js',
        chunkFilename: 'js/[name]-bundle.[chunkhash].js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ["file-loader?name=[name].[hash].css&outputPath=css/", "extract-loader", {
                    loader: "css-loader",
                    options: {
                        minimize: true
                    }
                }, "sass-loader", "postcss-loader"]
            }]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        drop_console: true
                    },
                    output: {
                        comments: false
                    }
                },
            }),
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                APP_ENV: JSON.stringify('browser')
            }
        }),
        new webpack.HashedModuleIdsPlugin(),
        new WebpackChunkHash()
    ]
})
