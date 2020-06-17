import { render } from './template.htl';

async function start() {
  document.body.insertAdjacentHTML("beforeend", await render('greeter', {name: 'Sue'}));
}

start();