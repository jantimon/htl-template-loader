import { render } from "./article.htl";

async function start() {
  document.body.insertAdjacentHTML(
    "beforeend",
    await render(
      "article",
      { name: "Sue", body: "Lorem ipsum" },
      { "com.foo.core.models.i18n": { salutation: "Hey", end: "The end" } }
    )
  );
}

start();
