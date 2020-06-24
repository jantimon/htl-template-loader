declare module '*.htl' {
  export const {
    getTemplate,
    getTemplates,
    getTemplateNames,
    render,
  }: typeof import ('./types') ;
  export default render;
}