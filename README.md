# htl-template-loader

![npm version](https://flat.badgen.net/npm/v/htl-template-loader)
![license](https://flat.badgen.net/github/license/jantimon/htl-template-loader)
![travis tests](https://flat.badgen.net/travis/jantimon/htl-template-loader)
![last commit](https://flat.badgen.net/github/last-commit/jantimon/htl-template-loader)
![pull requests](https://flat.badgen.net/github/prs/jantimon/htl-template-loader)
![commits](https://flat.badgen.net/github/commits/jantimon/htl-template-loader)

Webpack loader for HTL/Sightly data-sly-template templates. Based on [`@adobe/htlengine`](https://www.npmjs.com/package/@adobe/htlengine).

## Installation

`npm install --save htl-template-loader @adobe/htlengine`

## Usage

### Entire files

1. Add loader to `webpack.config.js`:

```js
{
  module: {
    rules: [
      {
        test: /\.htl$/,
        use: ["htl-template-loader"],
      },
    ];
  }
}
```

2. Create a template file `template.htl`:

```html
<h1>Hello World</h1>
```

3. Import render method

```js
import renderMain from './demo.html';

// Render the entire file
console.log(await renderMain());
```

### Templates

1. Add loader to `webpack.config.js`:

```js
{
  module: {
    rules: [
      {
        test: /\.htl$/,
        use: ["htl-template-loader"],
      },
    ];
  }
}
```

2. Create a template file `template.htl`:

```html
<template data-sly-template.greeter="${@ name}">
  <h1>Hello ${name}!</h1>
</template>
```

3. Import render method

```js
import { render } from './demo.html';

// If no template name is given use the first exported data-sly-template
console.log(await render({ name: 'Alex' }));

// To call a specific template pass the name as first parameter
console.log(await render('greeter', { name: 'Alex' }));
```

## Loader options

### templateRoot

The @adobe/htl-engine ships with a [`scriptResolver`](https://github.com/adobe/htlengine/blob/master/src/compiler/ScriptResolver.js) to align with the AEM template resolution logic.  
The `templateRoot` option allows to specify a base folder to lookup relative template paths like `example/headline.htl`.  

The following example would look up `example/headline.htl` in `/my-project/templates/example/headline.htl`:

```html
<sly
  data-sly-use.headline="example/headline.htl"
  data-sly-call="${headline.headline @ text=text}"
/>
```

```js
{
  module: {
    rules: [
      {
        test: /\.htl$/,
        use: {
          loader: "htl-template-loader",
          options: {
            templateRoot: "/my-project/templates",
          },
        },
      },
    ];
  }
}
```

## Typescript Typings

`htl-template-loader` provides optional typescript typings.
If you would like to define that all `*.htl` files export the htl-template-loader functions you can use:

```ts
declare module "*.htl" {
  export const {
    render,
    renderMain,
    getTemplate,
    getTemplates,
    getTemplateNames,
  }: typeof import("htl-template-loader/types");
  export default renderMain;
}
```

This will give you autocomplete and type detection:

```ts
import { render } from "./demo.html";
console.log(await render({ name: "Alex" }));
```

Unfortunately the `htl-template-loader` is not able to extract the typings for a specific template.  
However you can define the template parameters by hand:

```ts
import { getTemplate } from "./demo.html";
const greetTemplate = getTemplate<{ name: string }>("greet");

console.log(await greetTemplate({ name: "Alex" }));
```

## Runtime Models

`htl-template-loader` allows to define models which can be used inside a template

```html
<template data-sly-template.headline="${@ text}">
  <sly data-sly-use.myModel="com.foo.core.models.myModel" />
  <h1>${myModel.salutation} ${text}</h1>
</template>
```

Define the model for `com.foo.core.models.myModel` and execute the template:

```ts
import { render } from "./demo.html";
render(
  { text: "Alex" },
  {
    models: { "com.foo.core.models.myModel": { salutation: "hi" } },
  }
);
```

## Runtime Globals

`htl-template-loader` allows to define global variables which can be used inside a template

```html
<template data-sly-template.editMode="${@ text}">
  <h1>${text}</h1>
  <div data-sly-test="${wcmmode.edit}">Edit mode</div>
  <div data-sly-test="${!wcmmode.edit}">Live mode</div>
</template>
```

Define the data for `wcmmode.edit` and execute the template:

```ts
import { render } from "./demo.html";
render(
  { text: "Alex" },
  {
    globals: { wcmmode: { edit: true } },
  }
);
```

## Changelog

Since 5.0 the changelog can be found here https://github.com/jantimon/htl-template-loader/releases  
Old changelog entries can be found here https://github.com/jantimon/htl-template-loader/blob/b47c6d242903f5ab75c2f7f0935a4e2431dafd1d/CHANGELOG.md

## License

[MIT](http://www.opensource.org/licenses/mit-license)
