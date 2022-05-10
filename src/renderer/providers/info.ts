import { delay } from '../lib/utils/time';
import { Campaign, ProviderInformation } from './types';
import { ytNavigation } from './youtube/lib/navigation';

const youtubeMeta: ProviderInformation = {
  startUrl: 'https://www.youtube.com',
  loginUrl: 'https://www.youtube.com/account',
  loginCookie: 'LOGIN_INFO',
  navigation: ytNavigation,
};

const providerInfo: { [key: string]: ProviderInformation } = {
  youtube: youtubeMeta,
};

// To make some campaign always available, add them here.
const localActiveCampaings: Campaign[] = [];

const defaultDelay = 500;

// can be made more adaptable later on, only used in a couple of cases
const currentDelay = () => delay(defaultDelay);

export { providerInfo, localActiveCampaings, currentDelay };
