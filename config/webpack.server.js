const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const baseConfig = require('./webpack.base');
const paths = require('./paths');

module.exports = merge(baseConfig, {
  target: 'node',
  entry: {
    'server-entry': paths.serverEntry,
  },
  module: {
    rules: [
      {
        test: /\.(scss|sass)/,
        include: paths.sourceDir,
        use: [
          {
            loader: 'isomorphic-style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          }
        ]
      },
    ]
  },
  externals: [nodeExternals()],
});
