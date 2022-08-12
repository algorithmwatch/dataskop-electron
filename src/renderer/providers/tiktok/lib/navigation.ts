import { NavigationState } from 'renderer/contexts/types';

const ttDefault: NavigationState = {
  pageIndex: 0,
  pages: [
    {
      path: '/tiktok/start',
      sectionKey: null,
    },
    {
      path: '/provider_login',
      sectionKey: null,
    },
    {
      path: '/provider_login_success',
      sectionKey: null,
    },
  ],
  sections: {},
};

const ttNavigation = {
  'tt-default': ttDefault,
};

export { ttNavigation };
