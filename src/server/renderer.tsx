import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'fs';
import { StaticRouter, Route, Switch } from 'react-router-dom';
import { Context } from 'koa';
import routes from 'src/routes';
import App from '../App';

const template = fs.readFileSync('public/template.html', 'utf8');

export default async (ctx: Context) => {
  const { url } = ctx.req;

  const promises = routes
    .filter(route => route.component && route.component.hasOwnProperty('getInitialProps'))
    .map((route: any) => route.component.getInitialProps());

  const results = await Promise.all(promises);

  const initialPageProps = routes.reduce((props, route, index) => {
    props[route.key] = results[index];
    return props;
  }, {});

  const str = ReactDOMServer.renderToString(
    <StaticRouter location={url} context={{}}>
      <App>
        <Switch>
          {routes.map(({ component, key, ...rest }) => {
            const pageProps = initialPageProps[key] || {};
            component.defaultProps = {
              ...(component.defaultProps || {}),
              ...pageProps,
            }
            return (
              <Route
                key={key}
                {...rest}
                component={component}
              />
            )
          })}
        </Switch>
      </App>
    </StaticRouter>
  );

  return template
    .replace('<slot />', str)
    .replace('__app_default_props__', JSON.stringify(initialPageProps));
};
