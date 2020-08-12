const { getOptions, parseQuery } = require("loader-utils");
const { Compiler } = require("@adobe/htlengine");
const path = require("path");

module.exports = async function (source) {
  const templateApi = path.resolve(__dirname, "./lib/template-api");
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
      // The pure template id is provided by the htlengine and should not be set manually
      // it is used as internal cache key for the htlegine
      pureTemplateId: false,
      globalHtlObjects: Object.keys(require("./lib/runtime-variables")),
    },
    options,
    query
  );

  const relativeFileName = path.relative(
    this.context,
    this.request.replace(/^.+\!/, "").replace(/\?.+$/)
  );
  // Define the child template loading strategy
  const templateLoader = async (templatePath, scriptId) => {
    return {
      path: templatePath,
      code: `require('${templatePath}?pureTemplateId=${scriptId}')($);`,
    };
  };

  // Set up compiler
  const compiler = new Compiler()
    .withDirectory(this.rootContext)
    .includeRuntime(settings.includeRuntime)
    .withRuntimeHTLEngine(require.resolve("./lib/htl-runtime"))
    .withScriptResolver(
      require("@adobe/htlengine/src/compiler/ScriptResolver")([
        settings.templateRoot,
        ".",
      ])
    )
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
const ${varName} = require("${templateApi}")._getRuntimeModel($, '${moduleId}', '${baseDir}');`;
          }
    );

  // Templates which are required from another htl file will use a
  // different base template to not execute the main file
  if (settings.pureTemplateId) {
    const pureTemplate = getJsPureTemplate();
    compiler.withCodeTemplate(pureTemplate).withScriptId(query.pureTemplateId);
    return await compiler.compileToString(source, this.context);
  }

  // Compile
  let compiledCode = await compiler.compileToString(source, this.context);

  const resourceExtensionRegExp = `(${settings.resourceExtensions.join("|")})`;
  const componentMap = !settings.resourceRoot
    ? "{}"
    : `require.context(${JSON.stringify(
        path.resolve(this.rootContext, settings.resourceRoot)
      )}, true, /([^\\/]+)\\/\\1\\.${resourceExtensionRegExp}$/)`;

  return `// Generated by "@adobe/htlengine"
${compiledCode};
const componentMap = ${componentMap};
// Transform into htl-template-loader exports
module.exports = require("${templateApi}")/*#__PURE__*/(Runtime, run, componentMap, "${relativeFileName}");`;
};

/**
 * Read and cache the @adobe/htlengine JSPureTemplate file
 */
function getJsPureTemplate() {
  if (!getJsPureTemplate.cache) {
    getJsPureTemplate.cache = require("fs").readFileSync(
      require.resolve("@adobe/htlengine/src/compiler/JSPureTemplate.js"),
      "utf-8"
    );
  }
  return getJsPureTemplate.cache;
}
