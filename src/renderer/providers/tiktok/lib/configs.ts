import { Campaign, ScrapingConfig } from "renderer/providers/types";

export interface TikTokScrapingConfig extends ScrapingConfig {
  version: 1;
  provider: "tiktok";
  steps: any[];
  navigation: "tt-default";
}

const defaultConfig: TikTokScrapingConfig = {
  provider: "tiktok",
  navigation: "tt-default",
  version: 1,
  steps: [
    { type: "action", slug: "tt-data-export" },
    {
      type: "scraping",
      slug: "tt-scrape-watched-videos",
      maxVideos: 1000,
      maxScraping: 500,
      minWatchedSeconds: 5,
    },
  ],
  demoData: [],
};

const defaultCampaign: Campaign = {
  id: -2,
  slug: "tiktok-default",
  title: "tiktok default",
  description: "only for development",
  config: defaultConfig,
  featured: true,
};

export { defaultCampaign };
