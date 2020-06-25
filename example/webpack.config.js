const path = require("path");

module.exports = {
  devtool: "none",
  mode: "development",
  context: __dirname,

  output: {
    path: path.resolve(__dirname, "dist"),
  },

  module: {
    rules: [
      {
        test: /\.htl$/,
        use: {
          loader: path.resolve("./index.js"),
        },
      },
    ],
  },
};
