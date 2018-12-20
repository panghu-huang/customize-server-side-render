import * as pages from 'src/pages';

export default [
  {
    path: '/',
    key: 'home',
    exact: true,
    component: pages.Home,
  },
  {
    path: '/login',
    key: 'login',
    component: pages.Login,
  }
];
