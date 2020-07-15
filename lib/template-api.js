// @ts-check

/**
 * Returns the template api for the given htl-engine environemnt
 *
 * @param {typeof import("@adobe/htlengine/src/runtime/Runtime.js")} Runtime
 * @param {any} run
 * @param {WeakMap<import("@adobe/htlengine/src/runtime/Runtime.js"), (moduleId: string, baseDir: string) => {[key:string]: any}>} runtimeModelMap
 * @param {any} componentMap
 * @param {string} relativeFileName
 * @returns {import('../types')}
 */
module.exports = function (
  Runtime,
  run,
  runtimeModelMap,
  componentMap,
  relativeFileName
) {
  /**
   * The RuntimeEnvironment generates a function which
   * helps to load or mock models during template execution
   *
   * @param {{[key:string]: any} | ((moduleId: string, baseDir: string) => {[key:string]: any})} [runtimeModels]
   * @returns (moduleId: string, baseDir: string) => {[key:string]: any}
   */
  const createModelMappingFunction = (runtimeModels) => {
    if (runtimeModels && typeof runtimeModels !== "object") {
      return runtimeModels;
    }
    // Return an empty object as fallback
    return (moduleId) => (runtimeModels && runtimeModels[moduleId]) || {};
  };

  /**
   * Inject the runtimeEnvironment
   *
   * @param {import("@adobe/htlengine/src/runtime/Runtime.js")} runtime
   * @param {import("../types").ITemplateRuntimeEnvironment<any, any>} [runtimeEnvironment]
   */
  const attachRuntimeEnvironment = (runtime, runtimeEnvironment) => {
    // @ts-expect-error - setGlobal can handle a single argument
    runtime.setGlobal(
      Object.assign(
        {},
        require("./runtime-variables"),
        (runtimeEnvironment || {}).globals || {}
      )
    );
    runtimeModelMap.set(
      runtime,
      createModelMappingFunction((runtimeEnvironment || {}).models || {})
    );
    // Connect data-sly-resource with runtimeEnvironment.components
    runtime.withResourceLoader((runtime, resourceName, resourceParameters) => {
      const resourceType =
        resourceParameters && resourceParameters.resourceType;
      if (!resourceType) {
        return "";
      }

      const components = Object.assign(
        {},
        componentMap,
        runtimeEnvironment && runtimeEnvironment.components
      );
      const componentNames = Object.keys(components);
      // Find the componentName which ends with the given resourceType
      const resource = componentNames.find(
        (componentName) =>
          componentName.substr(-resourceType.length) === resourceType
      );
      if (resource) {
        return components[resource](runtimeEnvironment);
      }

      // Resources have the same file name as the folder name e.g.
      // ressourceItem/ressourceItem.html
      const resourceWithoutExtension =
        resourceType + "/" + resourceType.replace(/^.+\//, "");

      // Try to execute context component
      const contextComponet = componentMap.keys().find((componentName) => {
        // get the full file name for the component
        const name = componentName.replace(/\.[^\.]+$/, "");
        // return the component which ends with the given resourceType
        return (
          name.substr(-resourceWithoutExtension.length) ===
          resourceWithoutExtension
        );
      });
      if (contextComponet) {
        return componentMap(contextComponet)(runtimeEnvironment);
      }

      return "";
    });
  };

  /**
   * Render the main template instead of a single template
   * @param {any} runtimeEnvironment
   */
  const renderMain = (runtimeEnvironment) => {
    // Create runtime instance
    const runtime = new Runtime();
    attachRuntimeEnvironment(runtime, runtimeEnvironment);
    return run(runtime);
  };

  /**
   * Returns all templates of the given template
   * @param {any} runtimeEnvironment
   */
  const getTemplates = function getTemplates(runtimeEnvironment) {
    return getTemplateNames(runtimeEnvironment).then((templateNames) => {
      /** @type {{ [templateName: string]: (templateParameters: any, RuntimeEnvironment?: {[key:string]: any} | ((moduleId: string, baseDir: string) => {[key:string]: any})) => Promise<string>; }} */
      const templateRenderFunctions = {};
      templateNames.forEach((templateName) => {
        templateRenderFunctions[templateName] = getTemplate(templateName);
      });
      return templateRenderFunctions;
    });
  };

  /** Returns a named template */
  const getTemplate = function getTemplate(name) {
    return async (templateParameters, runtimeEnvironment) => {
      // Create runtime instance
      const runtime = new Runtime();
      attachRuntimeEnvironment(runtime, runtimeEnvironment);
      // Execute runtime to populate templates
      await run(runtime).catch(() => {});
      // Runtime calls are not encapsulated and memory is not released
      // Without resetting the buffer all previous rendering will still be present
      runtime.dom._buf = "";
      // @ts-expect-error
      const templates = runtime.template();
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
      return runtime.run(function* () {
        // @ts-expect-error - No idea why dom would not have a start method
        const $n = runtime.dom.start();
        yield runtime.call(templates[templateName], [$n, templateParameters]);
        return runtime.dom.end();
      });
    };
  };

  const getTemplateNames = function getTemplateNames(runtimeEnvironment) {
    // Create runtime instance
    const runtime = new Runtime();
    attachRuntimeEnvironment(runtime, runtimeEnvironment);
    // Execute runtime to populate templates
    return run(runtime)
      .catch(() => {})
      .then(() => {
        // Get all templates
        // @ts-expect-error - calling template without parameters returns all
        return Object.keys(runtime.template());
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
    const templateRuntimeEnvironment = args.shift();
    const template = getTemplate(templateName);
    return template(templateParameters, templateRuntimeEnvironment);
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
