export type NavigationState = {
  pageIndex: number;
  pages: NavigationStatePage[];
  sections: { [key: string]: { label: string } };
};

export type Path = string;
export type SectionKey = null | string;
export type LayoutProps = {
  hideHeader: boolean;
};

export type NavigationStatePage = {
  path: Path;
  sectionKey: SectionKey;
  layoutProps?: LayoutProps;
};
