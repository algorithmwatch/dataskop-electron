import { ProviderInformation } from '../types';
import { confirmCockieForm } from './lib/actions/confirm-cookies';
import { ytNavigation } from './lib/navigation';
import { createScrapingGenerator } from './lib/procedures';

const youtubeInfo: ProviderInformation = {
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  navigation: ytNavigation,
  confirmCookie: confirmCockieForm,
  createScrapingGenerator: createScrapingGenerator,
};

export * from './lib';
export { youtubeInfo };
