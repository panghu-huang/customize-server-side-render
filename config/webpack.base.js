const paths = require('./paths');

module.exports = {
  output: {
    path: paths.distDir,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      src: paths.sourceDir,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        include: paths.sourceDir,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
};
