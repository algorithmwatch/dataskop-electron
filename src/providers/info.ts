import { ProviderMetaInformation } from './types';
import { youtubeMeta } from './youtube';

const providerToMeta: { [key: string]: ProviderMetaInformation } = {
  youtube: youtubeMeta,
};

export { providerToMeta };
