import * as BabelMinifyPlugin from "babel-minify-webpack-plugin"
import * as CleanWebpackPlugin from "clean-webpack-plugin"
import CopyWebpackPlugin from "copy-webpack-plugin"
import { join, resolve } from "path"
import * as webpack from "webpack"

interface IMergedConfigParams {
  env: "prod" | "dev"
}

interface IPattern {
  from: string
  to?: string
}

function getMergedConfig({ env }: IMergedConfigParams): webpack.Configuration {
  const baseConfig = getBaseConfig()
  const specificConfig = getSpecificConfig(env, baseConfig)

  return { ...baseConfig, ...specificConfig }
}

function getPatterns(): IPattern[] {
  return [{ from: join("src", "icon.png") }, { from: join("src", "manifest.json") }]
}

function getBaseConfig(): webpack.Configuration {
  return {
    devtool: "source-map",
    entry: join(__dirname, "src", "background.ts"),
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
}

function getSpecificConfig(env: "prod" | "dev", baseConfig): webpack.Configuration {
  return env === "prod" ? getProdConfig(baseConfig) : getDevConfig(baseConfig)
}

function getProdConfig(baseConfig: webpack.Configuration): webpack.Configuration {
  return {
    module: {
      rules: [
        {
          test: /\.(t|j)s?$/,
          use: { loader: "awesome-typescript-loader" },
        },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      ],
    },
    plugins: [
      ...(baseConfig.plugins as webpack.Plugin[]),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production"),
        },
      }),
      new BabelMinifyPlugin(undefined, { comments: false }) as any,
    ],
  }
}

function getDevConfig(baseConfig): webpack.Configuration {
  return {
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(t|j)s?$/,
          use: { loader: "awesome-typescript-loader" },
        },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      ],
    },
    plugins: [
      ...baseConfig.plugins,
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("development"),
        },
      }),
      new webpack.NamedModulesPlugin(),
    ],
  }
}

export default getMergedConfig
