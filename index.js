const { getOptions, parseQuery } = require("loader-utils");
const { Compiler } = require("@adobe/htlengine");
const path = require("path");

module.exports = async function (source) {
  const options = getOptions(this);
  const query = this.resourceQuery ? parseQuery(this.resourceQuery) : null;
  const settings = Object.assign(
    {
      globalName: "__htl",
      includeRuntime: true,
      mockModelModules: true,
      resourceRoot: false,
      resourceExtensions: ["html"],
      templateRoot: this.rootContext,
      globalHtlObjects: Object.keys(require("./lib/runtime-variables")),
    },
    options,
    query
  );

  const relativeFileName = path.relative(
    this.context,
    this.request.replace(/^.+\!/, "").replace(/\?.+$/)
  );

  const templateBasePathes = [".", settings.templateRoot];
  const adobeTemplateLoader = require("@adobe/htlengine/src/compiler/TemplateLoader")(
    templateBasePathes
  );
  const templateLoader = (...args) => {
    const [base, uri] = args;
    this.addDependency(path.resolve(base, uri));
    return adobeTemplateLoader(...args);
  };

  // Set up compiler
  const compiler = new Compiler()
    .withDirectory(this.rootContext)
    .includeRuntime(settings.includeRuntime)
    .withRuntimeHTLEngine(require.resolve("./lib/htl-runtime"))
    .withTemplateLoader(templateLoader)
    .withRuntimeGlobalName(settings.globalName)
    .withRuntimeVar(settings.globalHtlObjects)
    .withModuleImportGenerator(
      !settings.mockModelModules
        ? defaultModuleGenerator
        : (baseDir, varName, moduleId) => {
            if (path.isAbsolute(moduleId)) {
              moduleId = `.${path.sep}${path.relative(baseDir, moduleId)}`;
            }
            return `// generated by ModuleImportGenerator ${__filename}
const ${varName} = function Model() {
  return Object.assign({use: function() {
    const runtimeModel = runtimeModelMap.get(runtime);
    return runtimeModel(${JSON.stringify(moduleId)}, ${JSON.stringify(
              baseDir
            )});
  }})
};`;
          }
    );

  // Compile
  let compiledCode = await compiler.compileToString(source, this.context);

  const resourceExtensionRegExp = `(${settings.resourceExtensions.join("|")})`;
  const componentMap = !settings.resourceRoot
    ? "{}"
    : `require.context(${JSON.stringify(
        path.resolve(this.rootContext, settings.resourceRoot)
      )}, true, /([^\\/]+)\\/\\1\\.${resourceExtensionRegExp}$/)`;

  return `
const runtimeModelMap = new WeakMap();
// Generated by "@adobe/htlengine"
${compiledCode};
const componentMap = ${componentMap};
// Transform into htl-template-loader exports
module.exports = require("${path.resolve(
    __dirname,
    "./lib/template-api"
  )}")(Runtime, run, runtimeModelMap, componentMap, "${relativeFileName}");
delete(module.exports.main);
  `;
};
