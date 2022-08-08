import { randomIntFromInterval } from '../lib/utils/math';
import { delay } from '../lib/utils/time';
import { tiktokInfo } from './tiktok';
import { defaultCampaign } from './tiktok/lib';
import { Campaign, ProviderInformation } from './types';
import { youtubeInfo } from './youtube';
import ytRoutes from './youtube/lib/routes';

const providerInfo: { [key: string]: ProviderInformation } = {
  youtube: youtubeInfo,
  tiktok: tiktokInfo,
};

// To make some campaign always available, add them here.
const localActiveCampaings: Campaign[] = [defaultCampaign];

const delays: { [key: string]: number } = { default: 1000, longer: 5000 };

// can be made more adaptable later on, only used in a couple of cases
const currentDelay = (type: string = 'default') =>
  delay(randomIntFromInterval(delays[type]));

const providerRoutes = [...Object.values(ytRoutes)];

export { providerInfo, localActiveCampaings, currentDelay, providerRoutes };
