type ITemplateParameters = { [key: string]: any } | string | number | boolean;

export type IModelLoader<
  TModel extends { [key: keyof TModel]: any },
  Key = keyof TModel
> = (key: Key) => TModels[Key] | Promise<TModels[Key]>;

/**
 * The runtime enviroment variables contain
 *  - models for data-sly-use
 *  - globals as in https://sling.apache.org/documentation/bundles/scripting/scripting-htl.html#global-objects
 *  - components used for data-sly-resource loading
 */
export type ITemplateRuntimeEnvironment<
  TModels extends { [key: string]: any },
  TGlobals extends { [key: string]: any }
> = {
  globals?: TGlobals;
  models?: TModels | IModelLoader<TModels>;
  components?: { [resourceType: string]: typeof renderMain };
};

/**
 * Render the first data-sly-template found in the template file
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 * @param {ITemplateRuntimeEnvironment} [runtimeEnvironment] - all values to be passed into the template
 */
export function render<
  TTemplateParameters extends ITemplateParameters,
  TModels extends { [key: string]: any },
  TGlobals extends { [key: string]: any }
>(
  templateParameters: TTemplateParameters,
  runtimeEnvironment?: ITemplateRuntimeEnvironment<TModels, TGlobals>
): Promise<string>;
/**
 * Render the data-sly-template with the given template name
 * @param {string} templateName - the name after `data-sly-template.` e.g. link for data-sly-template.link
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 * @param {ITemplateRuntimeEnvironment} [runtimeEnvironment] - all values to be passed into the template
 */
export function render<
  TTemplateParameters extends ITemplateParameters,
  TModels extends { [key: string]: any },
  TGlobals extends { [key: string]: any }
>(
  templateName: string,
  templateParameters: TTemplateParameters,
  runtimeEnvironment?: ITemplateRuntimeEnvironment<TModels, TGlobals>
): Promise<string>;
export function render(...args: any[]): Promise<string> {
  throw new Error("This function must not be called directly");
}

/**
 * Render the entire file content
 * @param {ITemplateParameters} [runtimeEnvironment] the runtime enviroment variables contain
 *  - models for data-sly-use
 *  - globals as in https://sling.apache.org/documentation/bundles/scripting/scripting-htl.html#global-objects
 *  - components used for data-sly-resource loading
 */
export function renderMain<
  TModels extends { [key: string]: any },
  TGlobals extends { [key: string]: any }
>(
  runtimeEnvironment?: ITemplateRuntimeEnvironment<TModels, TGlobals>
): Promise<string>;

export default renderMain;

/**
 * Returns all template names
 */
export function getTemplateNames(): Promise<string[]>;

/**
 * Get a single Template
 */
export function getTemplate<
  TTemplateParameters extends ITemplateParameters,
  TModels extends { [key: string]: any },
  TGlobals extends { [key: string]: any }
>(
  templateName?: string
): (
  templateParameters: TTemplateParameters,
  runtimeEnvironment?: ITemplateRuntimeEnvironment<TModels, TGlobals>
) => Promise<string>;

/**
 * Returns all template functions of the file
 */
export function getTemplates<
  TModels extends { [key: string]: any },
  TGlobals extends { [key: string]: any }
>(
  runtimeEnvironment?: ITemplateRuntimeEnvironment<TModels, TGlobals>
): Promise<{
  [templateName: string]: (
    templateParameters: { [key: string]: any },
    runtimeEnvironment?: ITemplateRuntimeEnvironment
  ) => Promise<string>;
}>;
