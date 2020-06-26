# htl-template-loader

Webpack loader for HTL/Sightly data-sly-template templates. Based on [`@adobe/htlengine`](https://www.npmjs.com/package/@adobe/htlengine).

## Installation

`npm install --save htl-template-loader @adobe/htlengine`

## Usage

See [./example](./example).

1. Add loader to `webpack.config.js`:

```js
{
  module: {
    rules: [
      {
        test: /\.htl$/,
        use: ["htl-template-loader"]
      }
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
import template from './template.htl';

// If no template name is given use the first exported data-sly-template
console.log(await template({ name: 'Alex' });

// To call a specific template pass the name as first parameter
console.log(await template('greeter', { name: 'Alex' });
```

## Loader options

### templateRoot

The @adobe/htl-engine provides ships with a `templateLoader` with its own resolve logic to import templates inside templates.

To the base folder for resolving subtemlates you cen set the `templateRoot` directly for the loader.

For example if your templates inside `/my-project/templates` and 
your templates uses another templaste called `example/headline.htl` you can set `/my-project/templates` as `templateRoot`:

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
        use: ["htl-template-loader"],
        options: {
          templateRoot: '/my-project/templates'
        }
      }
    ];
  }
}
```

## Typings

`htl-template-loader` provides optional typescript typings.
If you would like to define that all `*.htl` files export the htl-template-loader functions you can use:

```ts
declare module '*.htl' {
  export const {
    render,
    getTemplate,
    getTemplates,
    getTemplateNames,
  }: typeof import ('./types') ;
  export default render;
}
```

This will give you autocomplete and type detection:

```ts
import template from './demo.html';
console.log(await template({ name: 'Alex' }));
```

Unfortunately the `htl-template-loader` is not able to extract the typings for a specific template.  
However you can define the template parameters by hand:

```ts
import {getTemplate} from './demo.html';
const greetTemplate = getTemplate<{ name: string}>('greet');

console.log(await greetTemplate({name: 'Alex'}));
```


## License

[MIT](http://www.opensource.org/licenses/mit-license)
