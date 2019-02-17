const path = require('path'),
    webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        app: ['./src/index.tsx', './src/index.post.css'],
        vendor: ['react', 'react-dom']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.css']
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader'
            },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                  {
                    loader: 'style-loader',
                    options: {sourceMap: true}
                  },
                  MiniCssExtractPlugin.loader,
                  {
                    loader: 'css-loader',
                    options: {sourceMap: true, importLoaders: 1}
                  },
                  {
                    loader: 'postcss-loader',
                    options: {sourceMap:true}
                  }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({filename: "index.css"}),
        new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'src', 'index.html') }),
    ]
}
