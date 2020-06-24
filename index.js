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
      data: {},
      resourceRoot: this.rootContext,
    },
    options,
    query
  );

  const getRelativeFileName = () =>
    path.relative(
      this.context,
      this.request.replace(/^.+\!/, "").replace(/\?.+$/)
    );

  // Set up compiler
  const compiler = new Compiler()
    .withDirectory(this.rootContext)
    .includeRuntime(settings.includeRuntime)
    .withRuntimeHTLEngine(require.resolve("./lib/htl-runtime"))
    .withRuntimeGlobalName(settings.globalName);

  settings.runtimeVars.forEach((name) => {
    compiler.withRuntimeVar(name);
  });

  // Compile
  let compiledCode = await compiler.compileToString(source, this.context);

  return `
    module.exports = (...args) => module.exports.render(...args);
    module.exports.default = (...args) => module.exports.render(...args);
   
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

    /** Returns a named template */
    module.exports.getTemplate = function getTemplate(name) {
      return async (parameters) => {
        const templates = await module.exports.getTemplates();
        if (Object.keys(templates).length === 0) {
          throw new Error(\`File "${getRelativeFileName()}" does not export any data-sly-template."\`)
        }
        // Use the first exported template if no templateName was provided
        const templateName = name !== undefined ? name : Object.keys(templates)[0];
        if (!templates[templateName]) {
          throw new Error(\`File "${getRelativeFileName()}" does not export a template with the name "\${templateName}."\`)
        }
        // Execute template
        return templates[templateName](parameters);
      }
    }

    module.exports.getTemplateNames = async function getTemplateNames() {
      return Object.keys(await module.exports.getTemplates());
    }

    module.exports.render = async function template(...args) {
      // Make the templateName parameter optional
      // e.g.: render({ href: '#'})
      // e.g.: render('link', {href: '#'}) 
      const templateParameters = args[args.length - 1]; 
      const templateName = args.length > 1 ? args[0] : undefined;
      const template = module.exports.getTemplate(templateName);
      return template(templateParameters);
    }

    delete(module.exports.main);
  `;
};
