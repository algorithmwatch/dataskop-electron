import { Campaign } from 'renderer/providers/types';
import { TikTokScrapingConfig } from './types';

const defaultConfig: TikTokScrapingConfig = {
  provider: 'tiktok',
  navigation: 'tt-default',
  version: 1,
  steps: [{ type: 'action', slug: 'tt-data-export' }],
  demoData: [],
};

const defaultCampaign: Campaign = {
  id: -1,
  slug: 'tiktok-default',
  title: 'tiktok default',
  description: 'only for development',
  config: defaultConfig,
  featured: true,
};

export { defaultCampaign };
