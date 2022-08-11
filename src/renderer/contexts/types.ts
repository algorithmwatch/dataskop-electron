export type NavigationState = {
  pageIndex: number;
  pages: Array<{ path: string; sectionKey: null | string }>;
  sections: { [key: string]: { label: string } };
};
