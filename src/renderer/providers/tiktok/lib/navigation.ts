import { NavigationState } from "renderer/contexts/types";

const ttDefault: NavigationState = {
  pageIndex: 0,
  pages: [
    {
      path: "/tiktok/start",
      sectionKey: null,
    },
    {
      path: "/tiktok/intro",
      sectionKey: null,
    },
    {
      path: "/tiktok/tutorial",
      sectionKey: null,
    },
    {
      path: "/tiktok/before_login",
      sectionKey: null,
    },
    {
      path: "/tiktok/import_data_export",
      sectionKey: null,
    },
    {
      path: "/provider_login",
      sectionKey: null,
    },
    {
      path: "/provider_login_success",
      sectionKey: null,
    },
    {
      path: "/tiktok/waiting",
      sectionKey: null,
    },
    {
      path: "/tiktok/waiting_done",
      sectionKey: null,
    },
    {
      path: "/tiktok/viz_one",
      sectionKey: null,
    },
    {
      path: "/tiktok/viz_two",
      sectionKey: null,
    },
    {
      path: "/tiktok/viz_three",
      sectionKey: null,
    },
    {
      path: "/tiktok/donation_choice",
      sectionKey: null,
    },
    {
      path: "/tiktok/donation_upload",
      sectionKey: null,
    },
    {
      path: "/tiktok/newsletter",
      sectionKey: null,
    },
    {
      path: "/tiktok/thank_you",
      sectionKey: null,
    },
  ],
  sections: {},
};

const ttNavigation = {
  "tt-default": ttDefault,
};

export { ttNavigation };
