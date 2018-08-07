var webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
        filename: 'js/[name]-bundle.js',
        chunkFilename: 'js/[name]-bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ["file-loader?name=[name].css&outputPath=css/", "extract-loader", "css-loader", "postcss-loader", "sass-loader"]
            }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                APP_ENV: JSON.stringify('browser')
            }
        })
    ]
});