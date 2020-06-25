// @ts-check

/**
 * Returns the template api for the given htl-engine environemnt
 *
 * @param {any} Runtime
 * @param {any} run
 * @param {string} relativeFileName
 * @returns {import('../types')}
 */
module.exports = function (Runtime, run, relativeFileName) {
  /** @type {Promise<{ [templateName: string]: (templateParameters: any) => Promise<string>; }>} */
  let templateCache;
  const getTemplates = async function getTemplates() {
    // Create runtime instance
    const runtime = new Runtime();
    runtime.setGlobal({});
    // Execute runtime to populate templates
    templateCache =
      templateCache ||
      run(runtime)
        .catch(() => {})
        .then(() => {
          // Get all templates
          const templates = runtime.template();
          const templateNames = Object.keys(templates);
          /** @type {{ [templateName: string]: (templateParameters: any) => Promise<string>; }} */
          const templateRenderFunctions = {};
          templateNames.forEach((templateName) => {
            templateRenderFunctions[templateName] = (templateParameters) => {
              // Template to string method
              return runtime.run(function* () {
                const $n = runtime.dom.start();
                yield runtime.call(runtime.template()[templateName], [
                  $n,
                  templateParameters,
                ]);
                return runtime.dom.end();
              });
            };
          });
          return templateRenderFunctions;
        });
    return templateCache;
  };

  /** Returns a named template */
  const getTemplate = function getTemplate(name) {
    return async (parameters) => {
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
      return templates[templateName](parameters);
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
    const templateParameters = args[args.length - 1];
    const templateName = args.length > 1 ? args[0] : undefined;
    const template = getTemplate(templateName);
    return template(templateParameters);
  };

  // The api for the template module
  return Object.assign(render, {
    default: render,
    render,
    getTemplateNames,
    getTemplate,
    getTemplates,
  });
};
