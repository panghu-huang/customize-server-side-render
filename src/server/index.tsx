import Koa from 'koa';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import render from './renderer';

const app = new Koa();
const router = new Router();

app.use(koaStatic('public', {
  gzip: true,
  maxage: 10,
}));

router.get('*', (ctx) => {
  ctx.body = render(ctx);
  ctx.type = 'html';
});

app.use(router.routes());


app.listen(3000);

console.log('Application is running on http://127.0.0.1:3000');
