type ITemplateParameters = {[key: string]: any} | string | number | boolean

/**
 * Render the first data-sly-template found in the template file
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 */
export function render(templateParameters: ITemplateParameters): Promise<string>
/**
 * Render the data-sly-template with the given template name
 * @param {string} templateName - the name after `data-sly-template.` e.g. link for data-sly-template.link
 * @param {ITemplateParameters} templateParameters - all values to be passed into the template
 */
export function render(templateName: string, templateParameters: ITemplateParameters): Promise<string>
export function render(...args): Promise<string>
export default render;

/**
 * Returns all template names
 */
export function getTemplateNames(): Promise<string[]>

/**
 * Returns all template functions of the file
 */
export function getTemplates(): Promise<{[templateName: string]: (( templateParameters: ITemplateParameters) => Promise<string>)}>