const path = require("path");

module.exports = {
  entry: {
    popup: "./src/popup/index.ts",
    content: "./src/content/index.ts",
    background: "./src/background/index.ts",
    inject: "./src/content/inject.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    module: true,
  },
  devtool: "inline-source-map",
  mode: "production",
  optimization: {
    minimize: false,
  },
  experiments: {
    outputModule: true,
  },
};
