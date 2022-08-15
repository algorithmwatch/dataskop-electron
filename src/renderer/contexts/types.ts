export type NavigationState = {
  pageIndex: number;
  pages: NavigationStatePage[];
  sections: { [key: string]: { label: string } };
};

export type NavigationStatePage = {
  path: string;
  sectionKey: null | string;
  layoutProps?: {
    hideHeader: boolean;
  };
};
