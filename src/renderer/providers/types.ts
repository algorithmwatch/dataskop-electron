export type ProviderMetaInformation = {
  startUrl: string;
  loginUrl: string;
  loginCookie: string;
};

export interface ScrapingConfig {
  // enforce versioning of schema / type
  version: number;
  // for now: we only support youtube
  provider: string;
  // configuration for the scraper
  steps: any[];
}

export type Campaign = {
  id: number;
  // a human readable description of the config
  title: string;
  // the slug should be unique for a config
  slug: string;
  description: string;
  config: ScrapingConfig;
};
