/**
 * Load config from server and optionally select a campaign configuration.
 *
 * @module
 */
import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getActiveCampaigns } from "renderer/lib/networking";
import { localActiveCampaings, providerInfo } from "renderer/providers/info";
import { useConfig, useNavigation, useScraping } from "../contexts";

const SelectCampaignPage = (): JSX.Element => {
  const {
    state: { availableCampaigns, campaign },
    dispatch,
  } = useScraping();

  const { forceProvider }: { forceProvider: string } = useParams();

  const {
    state: {
      platformUrl,
      seriousProtection,
      updateCheckDone,
      userConfig,
      autoSelectCampaign,
    },
    sendEvent,
  } = useConfig();

  const { dispatch: navDispath } = useNavigation();
  const history = useHistory();

  const handleCampaignChange = (newCampaign: any) => {
    // Important to push first new state and *then* dispatching the new campaigns.
    // The base layout is updated when the campaign changes and this causes
    // a re-render of this page.
    history.push(
      providerInfo[newCampaign.config.provider].navigation[
        newCampaign.config.navigation
      ].pages[0].path,
    );

    dispatch({
      type: "set-campaign",
      campaign: newCampaign,
    });

    navDispath({
      type: "set-navigation-by-provider",
      provider: newCampaign.config.provider,
      navSlug: newCampaign.config.navigation,
    });
  };

  const handleCampaignClick = (index: number) => {
    const clickedCampaign = availableCampaigns[index];
    handleCampaignChange(clickedCampaign);
  };

  const setActiveCampaign = async () => {
    if (platformUrl == null || userConfig == null) return;

    // Wait until the update check is completed or monitoring step active.
    if (!userConfig.monitoring && !updateCheckDone) {
      window.electron.log.info(
        `Not fetching active campaings from backend yet. Monitoring:${userConfig.monitoring} UpdateCheckDone:${updateCheckDone}`,
      );
      return;
    }

    try {
      // Choose a default campaign
      if (autoSelectCampaign !== null && campaign === null) {
        window.electron.log.info("Set autoSelectCampaign", autoSelectCampaign);
        handleCampaignChange(localActiveCampaings[autoSelectCampaign]);
        return;
      }

      const campaigns = await getActiveCampaigns(
        platformUrl,
        seriousProtection,
      );

      sendEvent(null, "successfully fetched remote config");

      // only use campaigns that have a valid provider configuration
      const filteredCampaigns = campaigns.filter(
        (x) =>
          x.config &&
          x.config.provider &&
          (!forceProvider || forceProvider === x.config.provider),
      );

      // if a featured campaign exists, skip over the campaign selection page
      const featuredCampaigns = filteredCampaigns.filter((x) => x.featured);
      if (featuredCampaigns.length === 1) {
        handleCampaignChange(featuredCampaigns[0]);
        return;
      }

      // Check if there is maybe only one non-featured campaign
      if (filteredCampaigns.length === 1) {
        handleCampaignChange(filteredCampaigns[0]);
        return;
      }

      // Only set available campaigns to ask the user to choose one.
      dispatch({
        type: "set-available-campaigns",
        availableCampaigns: filteredCampaigns,
      });
    } catch (error) {
      window.electron.log.error(
        "not able to set sraping config from remote",
        error,
      );
      sendEvent(null, "failed to fetch remote config");
    }
  };

  useEffect(() => {
    setActiveCampaign();
  }, [platformUrl, seriousProtection, updateCheckDone, userConfig?.monitoring]);

  if (availableCampaigns.length === 0) return <div />;

  return (
    <div className="mx-auto flex flex-col h-full text-center">
      <div className="hl-4xl mb-6">Wähle eine Untersuchung aus</div>
      <div className="space-x-4">
        {availableCampaigns.map((x, i) => (
          <button
            key={x.id}
            type="button"
            className="p-5 mt-5 border-solid border-4 border-yellow-700"
            onClick={() => handleCampaignClick(i)}
          >
            <div className="hl-xl">{x.title}</div>
            <div>{x.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectCampaignPage;
