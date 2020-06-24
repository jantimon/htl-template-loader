type ITemplateParameters = {[key: string]: any} | string | number | boolean

/**
 * Render the first data-sly-template found in the template file
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 */
export function render(templateParameters: ITemplateParameters): Promise<string>

/**
 * Render the first data-sly-template found in the template file
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 */
export function render<TTemplateParameters extends ITemplateParameters>(templateParameters: TTemplateParameters): Promise<string>
/**
 * Render the data-sly-template with the given template name
 * @param {string} templateName - the name after `data-sly-template.` e.g. link for data-sly-template.link
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 */
export function render<TTemplateParameters extends ITemplateParameters>(templateName: string, templateParameters: TTemplateParameters): Promise<string>
export function render(...args: any[]): Promise<string> { throw new Error("This function must not be called directly") }
export default render;

/**
 * Returns all template names
 */
export function getTemplateNames(): Promise<string[]> 

/**
 * Get a single Template
 */
export function getTemplate<TTemplateParameters extends ITemplateParameters>(templateName?: string): (templateParameters: TTemplateParameters) => Promise<string>

/**
 * Returns all template functions of the file
 */
export function getTemplates(): Promise<{[templateName: string]: (( templateParameters: ITemplateParameters) => Promise<string>)}>