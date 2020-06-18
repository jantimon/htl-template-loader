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

## License

[MIT](http://www.opensource.org/licenses/mit-license)
