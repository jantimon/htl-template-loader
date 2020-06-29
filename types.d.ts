type ITemplateParameters = { [key: string]: any } | string | number | boolean;
export type ITemplateModelLoaderFunction = (
  moduleId: string,
  baseDir: string
) => { [key: string]: any };
export type ITemplateModelLoader =
  | ITemplateModelLoaderFunction
  | { [key: string]: any };
/**
 * Render the first data-sly-template found in the template file
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 */
export function render(
  templateParameters: ITemplateParameters,
  templateModelsMap?: ITemplateModelLoader
): Promise<string>;
/**
 * Render the data-sly-template with the given template name
 * @param {string} templateName - the name after `data-sly-template.` e.g. link for data-sly-template.link
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 */
export function render<TTemplateParameters extends ITemplateParameters>(
  templateName: string,
  templateParameters: TTemplateParameters,
  templateModelsMap?: ITemplateModelLoader
): Promise<string>;
export function render(...args: any[]): Promise<string> {
  throw new Error("This function must not be called directly");
}

/**
 * Render the entire file content
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 */
export function renderMain<TTemplateParameters extends ITemplateParameters>(
  mainTemplateParameters?: TTemplateParameters,
  templateModelsMap?: ITemplateModelLoader
): Promise<string>;
export default renderMain;

/**
 * Returns all template names
 */
export function getTemplateNames(): Promise<string[]>;

/**
 * Get a single Template
 */
export function getTemplate<TTemplateParameters extends ITemplateParameters>(
  templateName?: string
): (
  templateParameters: TTemplateParameters,
  modelLoader?: ITemplateModelLoader
) => Promise<string>;

/**
 * Returns all template functions of the file
 */
export function getTemplates(): Promise<{
  [templateName: string]: (
    templateParameters: ITemplateParameters,
    modelLoader?: ITemplateModelLoader
  ) => Promise<string>;
}>;
