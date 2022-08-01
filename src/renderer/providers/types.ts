import { NavigationState } from 'renderer/contexts';

export type GetCurrentHtml = () => Promise<{ html: string; hash: string }>;

export type GetHtmlFunction = (url: string) => Promise<GetCurrentHtml>;

export type GetHtmlLazyFunction = (
  url: string,
  scrollBottom: number,
  loadingDone: (html: string) => boolean,
  loadingAbort: (html: string) => boolean,
) => Promise<string>;

export type ProviderInformation = {
  startUrl: string;
  loginUrl: string;
  loginCookie: string;
  persistScrapingBrowser: boolean;
  navigation: { [key: string]: NavigationState };
  confirmCookie: () => void;
  deserializeConfigMapping: any;
};

export type DemoData = {
  title: string;
  // for the future: this can also be an url so the data may get fetched remotely
  data: any;
};

export interface ScrapingConfig {
  // enforce versioning of schema / type
  version: number;
  // name of platfrom that gets scraped, for now, we only support youtube
  provider: string;
  // configuration for the scraper
  steps: any[];
  // set to a builtin navigation config
  navigation: string;
  // for the demo mode
  demoData: DemoData[];
}

export type Campaign = {
  // -1 for local campaigns, all others should have a valid id (from the backend)
  id: number;
  // a human readable description of the config
  title: string;
  // the slug should be unique for a config
  slug: string;
  description: string;
  config: ScrapingConfig;
  featured: boolean;
};
