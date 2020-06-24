// @ts-check
const path = require("path");
const webpack = require("webpack");
const memfs = require("memfs");

async function compile(fixtureFolderName, options = {}) {
  const distFolder = path.resolve(__dirname, "/dist");
  const compiler = webpack({
    context: path.resolve(__dirname, "fixtures", fixtureFolderName),
    entry: `./entry.js`,
    mode: "development",
    output: {
      path: distFolder,
      filename: "bundle.js",
      libraryTarget: "commonjs2",
    },
    module: {
      rules: [
        {
          test: /\.htl$/,
          use: {
            loader: path.resolve(__dirname, "../index.js"),
            options,
          },
        },
      ],
    },
  });

  /**
   * https://github.com/webpack/webpack-dev-middleware/blob/2daa4ddac3cd977f84ce4d25507f0d658447e359/src/utils/setupOutputFileSystem.js#L28
   */
  const outputFileSystem = Object.assign(
    memfs.createFsFromVolume(new memfs.Volume()),
    {
      join: path.join.bind(path),
    }
  );
  compiler.outputFileSystem = outputFileSystem;

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors())
        reject(new Error([...stats.toJson().errors].join("\n")));
      const compiledJs = outputFileSystem
        .readFileSync(path.join(distFolder, "bundle.js"))
        .toString();
      const executedBundle = eval(compiledJs);
      resolve([executedBundle, stats]);
    });
  });
}

module.exports = { compile };
