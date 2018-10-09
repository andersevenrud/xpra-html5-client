const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const mode = process.env.NODE_ENV || 'development';
const minimize = mode === 'production';
const plugins = [];

if (mode === 'production') {
  plugins.push(new OptimizeCSSAssetsPlugin({
    cssProcessorOptions: {
      discardComments: true
    },
  }));
}

module.exports = {
  mode,
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'example/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    minimize,
    splitChunks: {
      chunks: 'all'
    }
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 9999
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'example/index.html')
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin([
      path.resolve(__dirname, 'example/logo.png'),
      path.resolve(__dirname, 'build/worker.js'),
      path.resolve(__dirname, 'build/worker.js.map')
    ])
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.png/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'file-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
