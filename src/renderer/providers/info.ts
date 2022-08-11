import { tiktokInfo } from './tiktok';
import { defaultCampaign } from './tiktok/lib';
import { Campaign, ProviderInformation } from './types';
import { youtubeInfo } from './youtube';

const providerInfo: { [key: string]: ProviderInformation } = {
  youtube: youtubeInfo,
  tiktok: tiktokInfo,
};

// To make some campaign always available, add them here.
const localActiveCampaings: Campaign[] = [defaultCampaign];

export { providerInfo, localActiveCampaings };
