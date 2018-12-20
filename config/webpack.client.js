const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const paths = require('./paths');

module.exports = merge(baseConfig, {
  target: 'web',
  entry: {
    app: paths.clientEntry,
  },
  output: {
    path: paths.publicDir,
  },
  module: {
    rules: [
      {
        test: /\.(scss|sass)/,
        include: paths.sourceDir,
        use: [
          {
            loader: 'style-loader',
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
});
