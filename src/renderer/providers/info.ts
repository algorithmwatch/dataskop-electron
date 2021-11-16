import { delay } from '../lib/utils/time';
import { youtubeMeta } from '../providers/youtube/lib';
import { ProviderMetaInformation } from './types';

const providerToMeta: { [key: string]: ProviderMetaInformation } = {
  youtube: youtubeMeta,
};

const defaultDelay = 500;

// can be made more adaptable later on
const currentDelay = () => delay(defaultDelay);

export { providerToMeta, currentDelay };
