const { getOptions, parseQuery } = require("loader-utils");
const { Compiler } = require("@adobe/htlengine");

module.exports = async function(source) {
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
      data: {},
      resourceRoot: this.rootContext
    },
    options,
    query
  );

  console.log(this.resourceQuery);

  // Set up compiler
  const compiler = new Compiler()
    .withDirectory(this.rootContext)
    .includeRuntime(settings.includeRuntime)
    .withRuntimeHTLEngine(require.resolve("./lib/htl-runtime"))
    .withRuntimeGlobalName(settings.globalName);

  settings.runtimeVars.forEach(name => {
    compiler.withRuntimeVar(name);
  });

  // Compile
  let compiledCode = await compiler.compileToString(source, this.context);

  return `
    module.exports = (templateName, templateParameters) => module.exports.render(templateName, templateParameters);
    module.exports.default = (templateName, templateParameters) => module.exports.render(templateName, templateParameters);
   
    ${compiledCode}

    module.exports.getTemplates = async function getTemplates() {
      // Create runtime instance
      const runtime = new Runtime();
      runtime.setGlobal({});
      // Execute runtime to populate templates
      await run(runtime).catch(() => {});
      // Get all templates
      const templates = runtime.template();
      const templateNames = Object.keys(templates);
      const templateRenderFunctions = {};
      templateNames.forEach((templateName) => {
        templateRenderFunctions[templateName] = (templateParameters) => {
          // Template to string method
          return runtime.run(function *() {
            const $n = runtime.dom.start();
            yield runtime.call(runtime.template()[templateName], [$n, templateParameters]);
            return runtime.dom.end();
          });
        }
      });
      return templateRenderFunctions;
    }

    module.exports.getTemplateNames = async function getTemplateNames() {
      return Object.keys(await module.exports.getTemplates());
    }

    module.exports.render = async function template(templateName, templateParameters) {
      const templates = await module.exports.getTemplates();
      if (!templates[templateName]) {
          throw new Error(\`File \${""} does not export a template with the name "\${templateName}."\`)
      }
      return templates[templateName](templateParameters);
    }

    delete(module.exports.main);
  `
};
