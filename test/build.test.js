// @ts-check
const assert = require("assert");
const path = require("path");
const { compile } = require("./utils");

describe("Build Tests", () => {
  it("Render a simple htl template.", async () => {
    const [bundleResult] = await compile("simple");
    const renderResult = await bundleResult.render("greeter", { name: "Alex" });
    assert.equal(renderResult.trim(), "<h1>Hello Alex!</h1>");
  });

  it("Render a htl template with nested data.", async () => {
    /** @type {[import('../types')]} - fixtures/simple/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("simple");
    const renderResult = await bundleResult.render("address", {
      address: {
        firstName: "Alex",
        lastName: "Doe",
        streetName: "SomeStreet",
        streetNumber: 44,
        postalCode: 12345,
        cityName: "SomeCity",
      },
    });
    assert.equal(
      renderResult.trim(),
      "<p>Alex Doe</p>\n  <p>SomeStreet 44</p>\n  <p>12345 SomeCity</p>"
    );
  });

  it("Returns template names.", async () => {
    /** @type {[import('../types')]} - fixtures/simple/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("simple");
    assert.equal(
      String(await bundleResult.getTemplateNames()),
      "greeter,address"
    );
  });

  it("Returns render functions.", async () => {
    /** @type {[import('../types')]} - fixtures/simple/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("simple");
    const templates = await bundleResult.getTemplates();
    const renderResult = await templates.greeter({ name: "Alex" });
    assert.equal(renderResult.trim(), "<h1>Hello Alex!</h1>");
  });

  it("If no template name is given use the first exported template.", async () => {
    /** @type {[import('../types')]} - fixtures/simple/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("simple");
    const renderResult = await bundleResult.render({ name: "Alex" });
    assert.equal(renderResult.trim(), "<h1>Hello Alex!</h1>");
  });

  it("Reports an error if the template does not contain the required template.", async () => {
    /** @type {[import('../types')]} - fixtures/simple/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("simple");
    let renderError;
    try {
      await bundleResult.render("WRONG-TEMPLATE-NAME", {
        name: "Alex",
      });
    } catch (e) {
      renderError = e.message;
    }
    assert.equal(
      renderError,
      'File "template.htl" does not export a template with the name "WRONG-TEMPLATE-NAME."'
    );
  });

  it("Returns a single renderable template", async () => {
    /** @type {[import('../types')]} - fixtures/simple/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("simple");
    const template = bundleResult.getTemplate("greeter");
    const templateResult = await template({
      name: "Alex",
    });
    assert.equal(templateResult.trim(), "<h1>Hello Alex!</h1>");
  });

  it("Returns the first renderable template if no name is given", async () => {
    /** @type {[import('../types')]} - fixtures/simple/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("simple");
    const template = bundleResult.getTemplate();
    const templateResult = await template({
      name: "Alex",
    });
    assert.equal(templateResult.trim(), "<h1>Hello Alex!</h1>");
  });

  it("It is able to import another template", async () => {
    /** @type {[import('../types')]} - fixtures/load-template/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("load-template");
    const template = bundleResult.getTemplate();
    const templateResult = await template({
      headline: "Hello",
      body: "How are you?",
    });
    assert.equal(
      templateResult.trim().replace(/\s\s+/g, ""),
      `<h1>Hello</h1><p>How are you?</p>`
    );
  });

  it("It is able to use a template-root-path", async () => {
    /** @type {[import('../types')]} - fixtures/template-root-path/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("template-root-path", {
      templateRoot: path.join(__dirname, "fixtures"),
    });
    const template = bundleResult.getTemplate();
    const templateResult = await template({
      headline: "Hello",
      body: "How are you?",
    });
    assert.equal(
      templateResult.trim().replace(/\s\s+/g, ""),
      `<h1>Hello</h1><p>How are you?</p>`
    );
  });

  it("It allows to provide models which to be used during runtime", async () => {
    /** @type {[import('../types')]} - fixtures/template-root-path/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("model", {
      templateRoot: path.join(__dirname, "fixtures"),
    });
    const template = bundleResult.getTemplate();
    const templateResult = await template(
      {
        text: "Alex",
      },
      { models: { "com.foo.core.models.myModel": { salutation: "Hey" } } }
    );
    assert.equal(templateResult.trim(), `<h1>Hey Alex</h1>`);
  });

  it("It allows to render all content of a file instead of a single template", async () => {
    /** @type {[import('../types')]} - fixtures/main-template/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("main-template", {
      templateRoot: path.join(__dirname, "fixtures"),
    });
    const template = bundleResult.renderMain;
    const templateResult = await template({
      models: { "com.foo.core.models.myModel": { salutation: "Greetings" } },
    });
    assert.equal(templateResult.trim(), `<h1>Greetings</h1>`);
  });

  it("It allows to access global values like wcmmode", async () => {
    /** @type {[import('../types')]} - fixtures/global-values/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("global-values", {
      templateRoot: path.join(__dirname, "fixtures"),
    });
    const renderMain = bundleResult.renderMain;
    const templateResult = await renderMain();
    assert.equal(templateResult.trim(), `<div>Live mode</div>`);
  });

  it("It allows to set global values like wcmmode", async () => {
    /** @type {[import('../types')]} - fixtures/global-values/entry.js returns a full htl-template-loader result */
    const [bundleResult] = await compile("global-values", {
      templateRoot: path.join(__dirname, "fixtures"),
    });
    const renderMain = bundleResult.renderMain;
    const templateResult = await renderMain({
      globals: { wcmmode: { edit: true } },
    });
    assert.equal(templateResult.trim(), `<div>Edit mode</div>`);
  });

  it("It allows to load resources", async () => {
    const [bundleResult] = await compile("components", {
      templateRoot: path.join(__dirname, "fixtures"),
    });
    const { template, resourceItem } = bundleResult;
    const result = await template({
      components: {
        "components/resourceItem": resourceItem,
      },
    });
    assert.equal(result.trim(), `<div>Resource Item</div>`);
  });
});
