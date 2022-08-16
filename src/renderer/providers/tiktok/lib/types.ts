import { ScrapingConfig } from "renderer/providers/types";

export interface TikTokScrapingConfig extends ScrapingConfig {
  version: 1;
  provider: "tiktok";
  steps: any[];
  navigation: "tt-default";
}
