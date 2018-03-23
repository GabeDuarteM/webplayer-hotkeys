import * as BabelMinifyPlugin from "babel-minify-webpack-plugin"
import * as CleanWebpackPlugin from "clean-webpack-plugin"
import CopyWebpackPlugin from "copy-webpack-plugin"
import { join, resolve } from "path"
import * as webpack from "webpack"

interface IPattern {
  from: string
  to?: string
}
function getPatterns(): IPattern[] {
  return [
    { from: join("src", "icon.png") },
    { from: join("src", "manifest.json") },
    { from: join("src", "first-time"), to: "first-time" },
  ]
}

const config: webpack.Configuration = {
  devtool: "source-map",
  entry: join(__dirname, "src", "background.ts"),
  module: {
    rules: [
      {
        test: /\.(t|j)s?$/,
        use: { loader: "awesome-typescript-loader" },
      },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
    ],
  },
  output: {
    filename: "background.js",
    path: join(__dirname, "dist"),
    publicPath: "/",
  },
  plugins: [new CleanWebpackPlugin(["dist"]), CopyWebpackPlugin(getPatterns())],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
}

export default config
