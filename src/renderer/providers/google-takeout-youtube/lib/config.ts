import { Campaign, ScrapingConfig } from "renderer/providers/types";

const defaultConfig: ScrapingConfig = {
  provider: "google-takeout-youtube",
  navigation: "default",
  version: 1,
  steps: [
    {
      type: "scraping",
      slug: "gtyt-scraping-watched-videos",
      maxVideos: 1000,
      maxScraping: 500,
    },
  ],
  demoData: [],
};

const defaultCampaign: Campaign = {
  id: -1,
  slug: "google-takeout-default",
  title: "google-takeout default",
  description: "only for development",
  config: defaultConfig,
  featured: false,
};

export { defaultCampaign };
