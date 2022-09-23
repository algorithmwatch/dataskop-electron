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
    { type: "action", slug: "tt-data-export-monitoring" },
    { type: "scraping", slug: "tt-scrape-watched-videos", max: 200 },
    { type: "scraping", slug: "tt-scrape-all-videos-for-time-frame", max: 200 },
  ],
  demoData: [],
};

const defaultCampaign: Campaign = {
  id: -1,
  slug: "tiktok-default",
  title: "tiktok default",
  description: "only for development",
  config: defaultConfig,
  featured: true,
};

export { defaultCampaign };
