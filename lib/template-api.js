// @ts-check

/**
 * Returns the template api for the given htl-engine environemnt
 *
 * @param {typeof import("@adobe/htlengine/src/runtime/Runtime.js")} Runtime
 * @param {any} run
 * @param {WeakMap<import("@adobe/htlengine/src/runtime/Runtime.js"), (moduleId: string, baseDir: string) => {[key:string]: any}>} runtimeModelMap
 * @param {string} relativeFileName
 * @returns {import('../types')}
 */
module.exports = function (Runtime, run, runtimeModelMap, relativeFileName) {
  /**
   * The ModelLoader generates a function which
   * helps to load or mock models during template execution
   *
   * @param {{[key:string]: any} | ((moduleId: string, baseDir: string) => {[key:string]: any})} [modelLoader]
   * @returns (moduleId: string, baseDir: string) => {[key:string]: any}
   */
  const createModelLoaderFunction = (modelLoader) => {
    if (modelLoader && typeof modelLoader !== "object") {
      return modelLoader;
    }
    // Return an empty object as fallback
    return (moduleId) => (modelLoader && modelLoader[moduleId]) || {};
  };

  /**
   * Render the main template instead of a single template
   * @param {*} globals
   * @param {*} modelLoader
   */
  const renderMain = (globals, modelLoader) => {
    // Create runtime instance
    const runtime = new Runtime();
    // @ts-expect-error - setGlobal can handle a single argument
    runtime.setGlobal(globals || {});
    runtimeModelMap.set(runtime, createModelLoaderFunction(modelLoader));
    return run(runtime);
  };

  const getTemplates = async function getTemplates() {
    // Create runtime instance
    const runtime = new Runtime();
    // @ts-expect-error - setGlobal can handle a single argument
    runtime.setGlobal({});
    // Execute runtime to populate templates
    return run(runtime)
      .catch(() => {})
      .then(() => {
        // Get all templates
        // @ts-expect-error - calling template without parameters returns all
        const templates = runtime.template();
        const templateNames = Object.keys(templates);
        /** @type {{ [templateName: string]: (templateParameters: any, modelLoader?: {[key:string]: any} | ((moduleId: string, baseDir: string) => {[key:string]: any})) => Promise<string>; }} */
        const templateRenderFunctions = {};
        templateNames.forEach((templateName) => {
          templateRenderFunctions[templateName] = (
            templateParameters,
            modelLoader
          ) => {
            // Template to string method
            return runtime.run(function* () {
              runtimeModelMap.set(
                runtime,
                createModelLoaderFunction(modelLoader)
              );
              // @ts-expect-error - No idea why dom would not have a start method
              const $n = runtime.dom.start();
              // @ts-expect-error - calling template without parameters returns all
              const allTemplates = runtime.template();
              yield runtime.call(allTemplates[templateName], [
                $n,
                templateParameters,
              ]);
              return runtime.dom.end();
            });
          };
        });
        return templateRenderFunctions;
      });
  };

  /** Returns a named template */
  const getTemplate = function getTemplate(name) {
    return async (parameters, modelLoader) => {
      const templates = await getTemplates();
      if (Object.keys(templates).length === 0) {
        throw new Error(
          `File "${relativeFileName}" does not export any data-sly-template."`
        );
      }
      // Use the first exported template if no templateName was provided
      const templateName =
        name !== undefined ? name : Object.keys(templates)[0];
      if (!templates[templateName]) {
        throw new Error(
          `File "${relativeFileName}" does not export a template with the name "${templateName}."`
        );
      }
      // Execute template
      return templates[templateName](parameters, modelLoader);
    };
  };

  const getTemplateNames = function getTemplateNames() {
    return getTemplates().then(function (templates) {
      return Object.keys(templates);
    });
  };

  const render = function template(...args) {
    // Make the templateName parameter optional
    // e.g.: render({ href: '#'})
    // e.g.: render('link', {href: '#'})
    // e.g.: render('link', {href: '#'}, { "com.foo.core.models.components.teaser" : { title: 'Demo' }})
    const templateName =
      args[0] === undefined || typeof args[0] === "string"
        ? args.shift()
        : undefined;
    const templateParameters = args.shift();
    const modelMap = args.shift();
    const template = getTemplate(templateName);
    return template(templateParameters, modelMap);
  };

  // The api for the template module
  return Object.assign(renderMain, {
    default: renderMain,
    render,
    renderMain,
    getTemplateNames,
    getTemplate,
    getTemplates,
  });
};
