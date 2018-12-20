import * as React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import routes from 'src/routes';
import App from './App';

declare global {
  interface Window {
    _APP_DEFAULT_PROPS_: object;
  }
}

const appDefaultProps = window._APP_DEFAULT_PROPS_;
const injectPropsScript = document.getElementById('injectProps') as HTMLScriptElement;
(injectPropsScript.parentNode as HTMLElement).removeChild(injectPropsScript);

hydrate(
  (
    <BrowserRouter>
      <App>
        <Switch>
          {routes.map(({ component, key, ...rest }) => {
            const pageProps = appDefaultProps[key] || {};
            component.defaultProps = {
              ...(component.defaultProps || {}),
              ...pageProps,
            }
            return (
              <Route
                {...rest}
                key={key}
                component={component}
              />
            )
          })}
        </Switch>
      </App>
    </BrowserRouter>
  ),
  document.querySelector('.app-container') as HTMLElement,
);
