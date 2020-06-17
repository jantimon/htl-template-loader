const path = require("path");

module.exports = {
  context: __dirname,

  output: {
    path: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [
      {
        test: /\.htl$/,
        use: {
          loader: path.resolve("./index.js")
        }
      }
    ]
  }

};
