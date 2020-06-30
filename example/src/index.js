import { render, renderMain } from "./article.htl";

async function start() {
  document.body.insertAdjacentHTML(
    "beforeend",

    // Render template data-sly-template.article
    await render(
      "article",
      { name: "Sue", body: "Lorem ipsum" },
      {
        models: {
          "com.foo.core.models.myModel": { salutation: "Hey", end: "The end" },
        },
      }
    )
  );

  document.body.insertAdjacentHTML(
    "beforeend",

    // Render the entire file
    await renderMain({
      models: {
        "com.foo.core.models.myModel": { salutation: "Hey", end: "The end" },
      },
    })
  );
}

start();
