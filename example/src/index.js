import { renderMain } from "./article.htl";

async function start() {
  document.body.insertAdjacentHTML(
    "beforeend",
    await renderMain(
      { name: "Sue", body: "Lorem ipsum" },
      { "com.foo.core.models.myModel": { salutation: "Hey", end: "The end" } }
    )
  );
}

start();
