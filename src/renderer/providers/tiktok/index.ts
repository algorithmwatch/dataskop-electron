import { ProviderInformation } from '../types';
import { ttNavigation } from './lib/navigation';
import { deserializeMapping } from './lib/procedures';

const tiktokInfo: ProviderInformation = {
  startUrl: 'https://www.tiktok.com',
  loginUrl: 'https://www.tiktok.com/login/',
  loginCookie: 'cmpl_token',
  persistScrapingBrowser: true,
  navigation: ttNavigation,
  confirmCookie: () => void 0,
  deserializeConfigMapping: deserializeMapping,
};

export * from './lib';
export { tiktokInfo };
