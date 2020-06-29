declare module '*.htl' {
  export const {
    getTemplate,
    getTemplates,
    getTemplateNames,
    render,
    renderMain
  }: typeof import ('./types') ;
  export default renderMain;
}