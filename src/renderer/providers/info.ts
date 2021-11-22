import { delay } from '../lib/utils/time';
import { ProviderInformation } from './types';
import { educationDemoCampaign as ytEduCampaign } from './youtube';
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

const localActiveCampaings = [ytEduCampaign];

const defaultDelay = 500;

// can be made more adaptable later on, only used in a couple of cases
const currentDelay = () => delay(defaultDelay);

export { providerInfo, localActiveCampaings, currentDelay };
