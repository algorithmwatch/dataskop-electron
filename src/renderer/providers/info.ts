import { delay } from '../lib/utils/time';
import { Campaign, ProviderInformation } from './types';
import { youtubeInfo } from './youtube';
import ytRoutes from './youtube/lib/routes';

const providerInfo: { [key: string]: ProviderInformation } = {
  youtube: youtubeInfo,
};

// To make some campaign always available, add them here.
const localActiveCampaings: Campaign[] = [];

const defaultDelay = 500;

// can be made more adaptable later on, only used in a couple of cases
const currentDelay = () => delay(defaultDelay);

const providerRoutes = [...Object.values(ytRoutes)];

export { providerInfo, localActiveCampaings, currentDelay, providerRoutes };
