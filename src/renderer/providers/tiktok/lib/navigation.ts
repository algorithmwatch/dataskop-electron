import routes from '../../../routes';

const ttDefault = {
  pageIndex: 0,
  pages: [
    {
      path: routes.START.path,
      sectionKey: null,
    },
    {
      path: routes.PROVIDER_LOGIN.path,
      sectionKey: null,
    },
    {
      path: routes.PROVIDER_LOGIN_SUCCESS.path,
      sectionKey: null,
    },
  ],
  sections: {},
};

const ttNavigation = {
  'tt-default': ttDefault,
};

export { ttNavigation };
