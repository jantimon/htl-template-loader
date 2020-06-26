const { getOptions, parseQuery } = require("loader-utils");
const { Compiler } = require("@adobe/htlengine");
const path = require("path");

module.exports = async function (source) {
  const options = getOptions(this);
  const query = this.resourceQuery ? parseQuery(this.resourceQuery) : null;
  const settings = Object.assign(
    {
      globalName: "htl",
      model: "default",
      useDir: null,
      transformSource: null,
      transformCompiled: null,
      includeRuntime: true,
      runtimeVars: [],
      moduleImportGenerator: null,
      mockModelModules: true,
      data: {},
      resourceRoot: this.rootContext,
      templateRoot: this.rootContext,
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
    )
    .withRuntimeGlobalName(settings.globalName);

  settings.runtimeVars.forEach((name) => {
    compiler.withRuntimeVar(name);
  });

  // Compile
  let compiledCode = await compiler.compileToString(source, this.context);

  return `
    const runtimeModelMap = new WeakMap();
    // Generated by "@adobe/htlengine"
    ${compiledCode};
    // Transform into htl-template-loader exports
    module.exports = require("${path.resolve(
      __dirname,
      "./lib/template-api"
    )}")(Runtime, run, runtimeModelMap, "${relativeFileName}");
    delete(module.exports.main);
  `;
};
