import { delay } from '../utils/time';
import { ProviderMetaInformation } from './types';
import { youtubeMeta } from './youtube';

const providerToMeta: { [key: string]: ProviderMetaInformation } = {
  youtube: youtubeMeta,
};

const defaultDelay = 500;

// can be made more adaptable later on
const currentDelay = () => delay(defaultDelay);

export { providerToMeta, currentDelay };
