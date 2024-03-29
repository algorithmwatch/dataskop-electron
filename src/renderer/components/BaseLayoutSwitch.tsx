import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigation, useScraping } from "renderer/contexts";
import YoutubeBase from "../providers/youtube/components/BaseLayout";
import BaseLayout from "./BaseLayout";

const BaseLayoutSwitch = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const {
    state: { campaign },
  } = useScraping();
  const { dispatch: navDispath, getPageIndexByPath } = useNavigation();

  const { pathname } = useLocation();

  // Keep page index in sync with the path name. The path name is not part of our
  // navigation context. We need to know the current route to, e.g., go to next
  // route.
  useEffect(() => {
    window.electron.log.info(`Navigate to: ${pathname}`);
    const pageIndex = getPageIndexByPath(pathname);
    if (pageIndex !== -1) {
      navDispath({ type: "set-page-index", pageIndex });
    }
  }, [pathname]);

  if (campaign?.config.provider === "youtube")
    return <YoutubeBase>{children}</YoutubeBase>;

  return <BaseLayout>{children}</BaseLayout>;
};

export default BaseLayoutSwitch;
