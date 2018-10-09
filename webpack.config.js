const path = require('path');
const mode = process.env.NODE_ENV || 'development';
const minimize = mode === 'production';

module.exports = [{
  mode,
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    library: 'XpraHtml5Client',
    libraryTarget: 'umd',
    auxiliaryComment: 'Xpra HTML5 Client Library'
  },
  optimization: {
    minimize
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}, {
  mode,
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/connection/worker.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'worker.js'
  },
  optimization: {
    minimize
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}];
