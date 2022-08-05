import { useScraping } from 'renderer/contexts';
import YoutubeBase from '../providers/youtube/components/BaseLayout';
import Base from './BaseLayout';

export default function BaseLayoutSwitch({ children }): JSX.Element {
  const {
    state: { campaign },
  } = useScraping();

  if (campaign?.config.provider == 'youtube')
    return <YoutubeBase>{children}</YoutubeBase>;

  return <Base>{children}</Base>;
}
