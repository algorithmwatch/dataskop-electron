import { NavigationState } from 'renderer/contexts';

export type ProviderInformation = {
  startUrl: string;
  loginUrl: string;
  loginCookie: string;
  navigation: { [key: string]: NavigationState };
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
};
