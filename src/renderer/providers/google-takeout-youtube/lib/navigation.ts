import { NavigationState } from "renderer/contexts/types";

const gtYtDefault: NavigationState = {
  pageIndex: 0,
  pages: [
    {
      path: "/tiktok/start",
      sectionKey: null,
    },
    {
      path: "/google-takeout-youtube/intro",
      sectionKey: null,
    },
    {
      path: "/google-takeout-youtube/import",
      sectionKey: null,
    },
    {
      path: "/google-takeout-youtube/waiting",
      sectionKey: null,
    },
    {
      path: "/google-takeout-youtube/viz_one",
      sectionKey: null,
    },
    {
      path: "/google-takeout-youtube/viz_two",
      sectionKey: null,
    },
    {
      path: "/google-takeout-youtube/outro",
      sectionKey: null,
    },
  ],
  sections: {},
};

const gtYtNavigation = {
  default: gtYtDefault,
};

export { gtYtNavigation };
