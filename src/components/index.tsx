import * as React from 'react';

const lazyload = (loader) => {
  const LazyComponent = React.lazy(loader);
  return function(props) {
    return (
      <React.Suspense>
        <LazyComponent {...props}/>
      </React.Suspense>
    )
  }
}

export const AsyncComponent = lazyload(() => import('./AsyncComponent'));
