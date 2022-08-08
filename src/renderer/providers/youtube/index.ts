import { ProviderInformation } from '../types';
import { confirmCockieForm } from './lib/actions/confirm-cookies';
import { ytNavigation } from './lib/navigation';
import { deserializeMapping } from './lib/procedures';

const youtubeInfo: ProviderInformation = {
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  persistScrapingBrowser: false,
  disableInputAfterLogin: true,
  navigation: ytNavigation,
  confirmCookie: confirmCockieForm,
  deserializeConfigMapping: deserializeMapping,
};

export * from './lib';
export { youtubeInfo };
