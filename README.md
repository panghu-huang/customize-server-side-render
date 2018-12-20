# TypeScript + Webpack + Koa 搭建自定义的 React 服务端渲染


## 原理：

1. 利用 webpack 打包能在 node 运行的 React 代码，利用 `react-dom/server` 将 React 代码渲染成 html 字符串返回给客户端

2. 利用 webpack 打包浏览器运行的 React 代码，在客户端用 `import { hydrate } from 'react-dom` hydrate 激活（添加事件等）

也可以使用 `babel-core/register` 让 React 代码能够运行在服务端，具体参考：[https://segmentfault.com/a/1190000012998848](https://segmentfault.com/a/1190000012998848)

## 新建项目

``` bash
$ mkdir customize-server-side-render
$ cd customize-server-side-render
# 初始化一个 package.json
$ yarn init -y
```

> 基本项目目录

```
|-- customize-server-side-render
    |-- config     webpack 打包配置文件和路径配置文件
        |-- paths   路径配置文件
        |-- webpack.base.js     公用的 webpack 打包配置
        |-- webpack.client.js   打包给客户端使用的脚本
        |-- webpack.server.js   打包给 node 使用的脚本
    |-- src        源码
        |-- App.tsx
        |-- index.tsx    客户端启动入口
        !-- server.tsx   服务端启动入口
    |-- server      koa 启动 http 服务代码
    |-- public      静态资源
    |-- dist        webpack 打包后的文件
    |-- package.json
    |-- tsconfig.json
    |-- tslint.json
    ...
```

> 安装一些依赖，想尝试 React Hooks，所以安装了 next 版本，服务端用 koa

```bash
$ yarn add react@next react-dom@next koa koa-router
$ yarn add webpack webpack-cli ts-loader typescipt -D
```

> 首先在 config 下面创建一个 paths.js,声明了有用到的 paths

```javascript
const path = require('path');

function resolveResource(filename) {
  return path.resolve(__dirname, `../${filename}`);
}

module.exports = {
  clientEntry: resolveResource('src/index.tsx'),
  serverEntry: resolveResource('src/server.tsx'),
  sourceDir: resolveResource('src'),
  distDir: resolveResource('dist'),
};
```

* webpack.base.js

```javascript
const paths = require('./paths');

module.exports = {
  mode: 'development',
  output: {
    path: paths.distDir,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
};

```

> 利用 `webpack-merge` 合并 webpack 配置

```bash
$ yarn add webpack-merge -D
```

* webpack.client.js

```javascript
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const paths = require('./paths');

module.exports = merge(baseConfig, {
  target: 'web',
  entry: paths.clientEntry,
})

```
> 运行 webpack --config config/webpack.client.js，打包出在客户端运行的脚本

##### 打包客户端代码出现问题：

```
ERROR in ./node_modules/react-dom/cjs/react-dom.development.js
Module not found: Error: Can't resolve 'object-assign' in '/Users/logan/Projects/backend/customize-server-side-render/node_modules/react-dom/cjs'
 @ ./node_modules/react-dom/cjs/react-dom.development.js 19:14-38
 @ ./node_modules/react-dom/index.js
 @ ./src/index.tsx
 ...
```

> 打包时出现了一些依赖未安装的问题，是开发版本的 react 引入的库，这里都给他安装一下

```bash
$ yarn add object-assign prop-types scheduler -D
```

> 依然出现上面的问题

> 猜测可能是没有引入 `babel` 的原因

最终结果并不是，是由于 resolve.extensions 中我只配置了 ts 和 tsx 结尾的文件类型，但是没有 js 和 jsx 结尾的。修改 webpack.base.js

```javascript
const paths = require('./paths');

module.exports = {
  output: {
    path: paths.distDir,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        include: paths.sourceDir,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
};
```

## 启动 Node 服务

> 在 `server` 下面创建一个 `index.js`

```javascript
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  ctx.body = 'Hello world Koa';
});

app.use(router.routes());

app.listen(3000);

console.log('Application is running on http://127.0.0.1:3000');
```

> 运行 `node server/index.js`,看见服务启动正常，但是修改了 `server` 下面的 `index.js` 无法自己重启 node 服务，所以准备利用 `nodemon` 运行

```bash
$ yarn add nodemon -D
```

> 修改启动脚本为

```bash
$ nodemon server/index.js
```

> OK, node 服务能在修改后自己重启。

## 编译 React 在服务端

```javascript
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const paths = require('./paths');

module.exports = merge(baseConfig, {
  target: 'node',
  entry: {
    'server-entry': paths.serverEntry,
  },
})
```

> 将打包后的 `server-entry.js` 在 server/index.js 中引入， 利用 react-dom/server 模块中的 renderToString 方法渲染成 html

```javascript
const ReactDOMServer = require('react-dom/server');
const serverEntry = require('../dist/server-entry');

const str = ReactDOMServer.renderToString(serverEntry);
```

> 但是发现 require 进来的 serverEntry 只是一个空对象。

* 利用 `webpack-node-externals` 插件，webpack 将不打包 path, fs 等原生 node 模块下面的模块
* output 中设置 libraryTarget 为 `commonjs`，webpack.server.js 如下：

```javascript
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const baseConfig = require('./webpack.base');
const paths = require('./paths');

module.exports = merge(baseConfig, {
  target: 'node',
  entry: {
    'server-entry': paths.serverEntry,
  },
  output: {
    libraryTarget: 'commonjs',
  },
  externals: [nodeExternals()],
})

```

然后 require server-entry 的方式变为:
```javascript
const serverEntry = require('../dist/server-entry').default;
```

> 然后就可以看见浏览器上显示出了 <App /> 的内容，但是每次运行都要 `yarn dev:client`、`yarn dev:server`、`yarn dev`，而且还不能用 `&&` 连接，因为 `yarn dev:client` 中 `webpack --watch` 会卡在当前进程，所以可以用 `npm-run-all` 一次运行三个脚本

```bash
$ yarn add npm-run-all -D
```

> 最终启动脚本变为：

```
"start": "npm-run-all --parallel \"dev\" \"dev:client\" \"dev:server\""
```

## 利用 HTML 模板文件

> 在 `public` 下面新建一个 `index.html`

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Customize Server side render</title>
  </head>
  <body>
    <!-- 服务端会替换 <slot />，也可以使用 koa-views 等插件实现 -->
    <div class="app-container"><slot /></div>
  </body>
</html>
```

> 修改 `server/index.js` 内容：

```javascript
const Koa = require('koa');
const Router = require('koa-router');
// 新增
const fs = require('fs');
const path = require('path');
const ReactDOMServer = require('react-dom/server');
const serverEntry = require('../dist/server-entry').default;

const app = new Koa();
const router = new Router();

// 新增
const template = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');

router.get('*', (ctx) => {
  // 新增
  const str = ReactDOMServer.renderToString(serverEntry);
  ctx.body = template.replace('<slot />', str);
  ctx.type = 'html';
});

app.use(router.routes());

app.listen(3000);

console.log('Application is running on http://127.0.0.1:3000');

```

> 但是 `react-dom/server` 模块只是将 jsx 渲染成 html，但是他没有 document 等 html 元素，所以他并没有绑定点击事件等，所以需要将代码在浏览器端再运行一遍（浏览器激活）


> 将浏览器再运行一次的原理就是，将 `webpack.client.js` 的 output 中 path 设置为 public 目录，然后将 public 目录设置为 koa 中的静态资源目录。

* 将 `public` 设置为静态资源目录

```javascript
const koaStatic = require('koa-static');

const app = new Koa();

// 这句一定要在 router.get('*') 之前，不然请求到 router.get('*') 中直接返回了，不会再找 public 中的静态资源
app.use(koaStatic(path.resolve(__dirname, '../public')));
```

* index.html 中引入即可

```html
<script type="text/javascript" src='/app.js'></script>
```

> 这样子，客户端运行的时候就回去加载 `public/app.js`，从而达到客户端激活的目的

* 修改 webpack.client.js

```javascript
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const paths = require('./paths');

module.exports = merge(baseConfig, {
  target: 'web',
  entry: {
    app: paths.clientEntry,
  },
  output: {
    // 指向 public 目录
    path: paths.publicDir,
  },
});

```

> 但是，这样子访问 `http://localhost: 3000` 时，他走的不是 `router.get('/')`, 而是 public/index.html，这个有很多种方式解决，比如修改 `public/index.html` -> `public/template.html`等。

## 加载样式

> 安装依赖

```bash
$ yarn add style-loader css-loader scss-loader node-sass -D
```

客户端打包没问题，但是 style-loader 需要 window 对象，但是 `webpack.server.js` 是打包给 node 用的，没有 window ，会报错

```
webpack:///./node_modules/style-loader/lib/addStyles.js?:23
	return window && document && document.all && !window.atob;
	^

ReferenceError: window is not defined
    at eval (webpack:///./node_modules/style-loader/lib/addStyles.js?:23:2)
    at eval (webpack:///./node_modules/style-loader/lib/addStyles.js?:12:46)
    at module.exports (webpack:///./node_modules/style-loader/lib/addStyles.js?:80:88)
    at eval (webpack:///./src/components/Container/style.scss?:16:140)
    at Object../src/components/Container/style.scss (/Users/logan/Projects/backend/customize-server-side-render/dist/server-entry.js:165:1)
    at __webpack_require__ (/Users/logan/Projects/backend/customize-server-side-render/dist/server-entry.js:20:30)
    at eval (webpack:///./src/components/Container/index.tsx?:4:69)
    at Module../src/components/Container/index.tsx (/Users/logan/Projects/backend/customize-server-side-render/dist/server-entry.js:154:1)
    at __webpack_require__ (/Users/logan/Projects/backend/customize-server-side-render/dist/server-entry.js:20:30)
    at eval (webpack:///./src/App.tsx?:6:79)
```

所以将样式 loader 拆开，在 `webpack.server.js` 中用 [isomorphic-style-loader](https://github.com/kriasoft/isomorphic-style-loader) 代替 `style-loader`

## 路由同构

服务端渲染时，不能使用 `BrowswerRouter` 或者 `HashRouter`，而是 `StaticRouter`，参考地址：

* [https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/StaticRouter.md](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/StaticRouter.md)

* [https://github.com/react-translate-team/react-router-CN/blob/master/packages/react-router/docs/api/StaticRouter.md](https://github.com/react-translate-team/react-router-CN/blob/master/packages/react-router/docs/api/StaticRouter.md)

> 可以看到，`StaticRouter` 需要用到请求参数中的 `path` 甚至 `context`，因此需要对结构做一些改变，让 node 启动的入口直接引入 `<App />` ，而不是通过 `require` 加载 webpack 打包过的

* `src` 下面新建 `server` 目录，新建 `index.tsx`，这样服务端的内容也能够使用 `typescript`

* 把 `server/index.js` 内容转入 `src/server/index.tsx`，安装 `@types/node`

* 原本用 `require` 引入的方式都改为 `import`

* 修改 `paths` 下面的 `serverEntry`，修改 `src/server/index.tsx` 下面引用的文件路径，利用 `typescript` 以后，路劲引用就不用 `path.resolve(__dirname, 'path/to/file')`，直接项目目录下文件夹开始就行，如果引用 `project/public` 下面的 `public` 目录，直接 public 即可。

* 修改后的 `src/server/index.tsx` 为：

```javascript
import * as React from 'react';
import * as fs from 'fs';
import Koa from 'koa';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import * as ReactDOMServer from 'react-dom/server';
import App from '../App';

const app = new Koa();
const router = new Router();

const template = fs.readFileSync('public/template.html', 'utf8');

app.use(koaStatic('public', {
  gzip: true,
  maxage: 10,
}));

router.get('*', (ctx) => {
  const str = ReactDOMServer.renderToString(<App />);
  ctx.body = template.replace('<slot />', str);
  ctx.type = 'html';
});

app.use(router.routes());


app.listen(3000);

console.log('Application is running on http://127.0.0.1:3000');

```

> 修改 `renderToString` 的过程

```javascript
const str = ReactDOMServer.renderToString(
    <StaticRouter location={ctx.req.url} context={{}}>
      <App />
    </StaticRouter>
  );
```

> 这是服务端添加了 `Router`，但是这样子直接运行的话，浏览器会报错：

```javascript
 You should not use <Route> or withRouter() outside a <Router>
```

这是因为服务端添加了 `StaticRouter`，但是客户端外层却并没有添加一个 Router

修改 `src/index.tsx`

```javascript
import * as React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

hydrate(
  (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ),
  document.querySelector('.app-container') as HTMLElement,
);
```

> 添加路由成功！
