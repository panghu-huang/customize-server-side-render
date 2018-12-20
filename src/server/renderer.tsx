import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'fs';
import { StaticRouter } from 'react-router-dom';
import { Context } from 'koa';
import App from '../App';

const template = fs.readFileSync('public/template.html', 'utf8');

export default (ctx: Context) => {
  const str = ReactDOMServer.renderToString(
    <StaticRouter location={ctx.req.url} context={{}}>
      <App />
    </StaticRouter>
  );
  return template.replace('<slot />', str);
};
