import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useConfig, useNavigation, useScraping } from "renderer/contexts";
import { localActiveCampaings } from "renderer/providers/info";
import YoutubeBase from "../providers/youtube/components/BaseLayout";
import BaseLayout from "./BaseLayout";

const BaseLayoutSwitch = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const {
    dispatch,
    state: { campaign },
  } = useScraping();
  const { dispatch: navDispath, getPageIndexByPath } = useNavigation();
  const {
    state: { autoSelectCampaign },
  } = useConfig();
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

  // For development, selection a local campaign with `autoSelectCampaign`.
  // Set the value in .env. This ensure that HMR works as indented.
  useEffect(() => {
    if (!module.hot) return;
    if (autoSelectCampaign === null) return;

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const campaign = localActiveCampaings[autoSelectCampaign];

    window.electron.log.info(
      `Choosing local campaign with autoSelectCampaign=${autoSelectCampaign}`,
    );

    dispatch({
      type: "set-campaign",
      campaign,
    });

    navDispath({
      type: "set-navigation-by-provider",
      provider: campaign.config.provider,
      navSlug: campaign.config.navigation,
      pathname,
    });
  }, [autoSelectCampaign]);

  if (campaign?.config.provider === "youtube")
    return <YoutubeBase>{children}</YoutubeBase>;

  return <BaseLayout>{children}</BaseLayout>;
};

export default BaseLayoutSwitch;
