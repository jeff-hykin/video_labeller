"use strict"

process.env.BABEL_ENV = "main"

const path = require("path")
const { dependencies } = require("../package.json")
const webpack = require("webpack")

let mainConfig = {
    entry: {
        main: path.join(__dirname, "../src/electron-app-setup.js"),
    },
    externals: [...Object.keys(dependencies || {})],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.node$/,
                use: "node-loader",
            },
        ],
    },
    node: {
        __dirname: process.env.NODE_ENV !== "production",
        __filename: process.env.NODE_ENV !== "production",
    },
    output: {
        filename: "[name].js",
        libraryTarget: "commonjs2",
        path: path.join(__dirname, "../dist/electron"),
    },
    plugins: [new webpack.NoEmitOnErrorsPlugin()],
    resolve: {
        extensions: [".js", ".json", ".node"],
    },
    target: "electron-main",
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== "production") {
    mainConfig.plugins.push(
        new webpack.DefinePlugin({
            __static: `"${path.join(__dirname, "../static").replace(/\\/g, "\\\\")}"`,
        })
    )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === "production") {
    mainConfig.plugins.push(
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": '"production"',
        }),
        new webpack.ProvidePlugin({
            Promise: 'imports-loader?this=>global!exports-loader?global.Promise!es6-promise',
            fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
        }),
    )
}

module.exports = mainConfig
