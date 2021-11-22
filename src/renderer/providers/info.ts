import { delay } from '../lib/utils/time';
import { youtubeMeta } from '../providers/youtube/lib';
import { ProviderInformation } from './types';

const providerInfo: { [key: string]: ProviderInformation } = {
  youtube: youtubeMeta,
};

const defaultDelay = 500;

// can be made more adaptable later on
const currentDelay = () => delay(defaultDelay);

export { providerInfo, currentDelay };
