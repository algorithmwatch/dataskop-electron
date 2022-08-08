import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation, useScraping } from 'renderer/contexts';
import YoutubeBase from '../providers/youtube/components/BaseLayout';
import Base from './BaseLayout';

export default function BaseLayoutSwitch({ children }): JSX.Element {
  const {
    state: { campaign },
  } = useScraping();
  const { dispatch, getPageIndexByPath } = useNavigation();
  const { pathname } = useLocation();

  // Keep page index in sync with the path name. The path name is not part of our
  // navigation context. We need to know the current route to, e.g., go to next
  // route.
  useEffect(() => {
    const pageIndex = getPageIndexByPath(pathname);
    if (pageIndex !== -1) {
      dispatch({ type: 'set-page-index', pageIndex });
    }
  }, [pathname]);

  if (campaign?.config.provider == 'youtube')
    return <YoutubeBase>{children}</YoutubeBase>;

  return <Base>{children}</Base>;
}
