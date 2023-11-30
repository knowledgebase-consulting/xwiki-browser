const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    target: 'electron-main',
    entry: { main: './main.js',
             preload: './resources/preload/preload.js',
             createMenu: './resources/menu/menu.js' 
    },
    output: {
        path: path.resolve('./build'),
        filename: '[name].js'
    },
    node: {
        __dirname: true
    },
    plugins: [
        new CopyPlugin({
          patterns: [
            { from: "./resources", to: "./resources" },
          ],
        }),
    ],
    externals: [ {
        'electron-debug': 'require(\'electron-debug\')',
        'electron-reload': 'require(\'electron-reload\')'
    } ],
    resolve: {
        modules: [
            path.resolve('./node_modules')
        ]
    }
};

