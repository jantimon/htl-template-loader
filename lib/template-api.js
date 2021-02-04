// @ts-check
/**
 * The runtimeEnvironmentMap attaches additional values to the runtime
 * like custome globals, models and components
 * @type {WeakMap<import("@adobe/htlengine/src/runtime/Runtime.js"), {models: {}, globals: {}, components: {}}>}
 */
const runtimeEnvironmentMap = new WeakMap();
/**
 * Returns the template api for the given htl-engine environemnt
 *
 * @param {typeof import("@adobe/htlengine/src/runtime/Runtime.js")} Runtime
 * @param {any} run
 * @param {any} componentMap
 * @param {string} relativeFileName
 * @returns {import('../types')}
 */
module.exports = function (Runtime, run, componentMap, relativeFileName) {
  /**
   * Inject the runtimeEnvironment
   *
   * @param {import("@adobe/htlengine/src/runtime/Runtime.js")} runtime
   * @param {import("../types").ITemplateRuntimeEnvironment<any, any>} [runtimeEnvironment]
   */
  const attachRuntimeEnvironment = (runtime, runtimeEnvironment) => {
    const runtimeEnvironmentWithDefaults = {
      models: {},
      globals: {},
      components: {},
      ...runtimeEnvironment,
    };
    // Attach runtime environment for external template and resource loading
    runtimeEnvironmentMap.set(runtime, runtimeEnvironmentWithDefaults);

    // Loader for data-sly-include
    runtime.withIncludeHandler((runtime, uri, options) => {
      // Right now `uri` is an relative path to the CWD which is only known during runtime
      // therefore it can't be preloaded during compile time
      //
      // Moving it to compile time can only done by @adobe/htlengine
      //
      // For now as a fallback we just return the include path
      return `<!-- Include: ${uri} - compile time include not supported by @adobe/htlengine -->`;
    });

    // @ts-expect-error - setGlobal can handle a single argument
    runtime.setGlobal(
      Object.assign(
        {},
        require("./runtime-variables"),
        runtimeEnvironmentWithDefaults.globals
      )
    );
    // Connect data-sly-resource with runtimeEnvironment.components
    runtime.withResourceLoader((runtime, resourceName, resourceParameters) => {
      const resourceType =
        resourceParameters && resourceParameters.resourceType;
      if (!resourceType) {
        return "";
      }

      const components = runtimeEnvironmentWithDefaults.components;
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
      const resolveError = await run(runtime).then(
        () => undefined,
        (error) => error
      );
      // @ts-expect-error
      const templates = runtime.template("global");
      if (Object.keys(templates).length === 0) {
        if (resolveError) {
          throw resolveError;
        }
        throw new Error(
          `File "${relativeFileName}" does not export any data-sly-template."`
        );
      }
      // Use the first exported template if no templateName was provided
      const templateName =
        name !== undefined ? name : Object.keys(templates)[0];
      if (!templates[templateName]) {
        if (resolveError) {
          throw resolveError;
        }
        throw new Error(
          `File "${relativeFileName}" does not export a template with the name "${templateName}."`
        );
      }
      // Execute template
      return runtime.run(function* () {
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
        return Object.keys(runtime.template("global"));
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

module.exports._getRuntimeEnvironment = (runtime) =>
  runtimeEnvironmentMap.get(runtime);

/**
 * Returns the model mock data for the given moduleId and baseDir
 */
module.exports._getRuntimeModel = (runtime, moduleId, baseDir) =>
  function Model() {
    return {
      use: function () {
        const runtimeEnvironment = module.exports._getRuntimeEnvironment(
          runtime
        );
        const modelCreator = runtimeEnvironment.models[moduleId];
        const model =
          typeof modelCreator === "function"
            ? modelCreator(moduleId, baseDir)
            : modelCreator;
        if (model === undefined) {
          throw new Error('Could not find model data for "' + moduleId + '"');
        }
        return model;
      },
    };
  };
