import * as CleanWebpackPlugin from "clean-webpack-plugin"
import * as CopyWebpackPlugin from "copy-webpack-plugin"
import * as ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin"
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
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: "background.js",
    path: join(__dirname, "dist"),
    publicPath: "/",
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new CopyWebpackPlugin(getPatterns()),
    new ForkTsCheckerWebpackPlugin(),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
}

export default config
