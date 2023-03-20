import {
  defaultCampaign as gtytC,
  googleTakeoutYoutubeInfo,
} from "./google-takeout-youtube";
import { defaultCampaign as ttC, tiktokInfo } from "./tiktok";
import { Campaign, ProviderInformation } from "./types";
import { defaultCampaign as ytC, youtubeInfo } from "./youtube";

const providerInfo: { [key: string]: ProviderInformation } = {
  youtube: youtubeInfo,
  tiktok: tiktokInfo,
  "google-takeout-youtube": googleTakeoutYoutubeInfo,
};

// To make some campaign always available, add them here.
const localActiveCampaings: Campaign[] = [ytC, ttC, gtytC];

export { providerInfo, localActiveCampaings };
