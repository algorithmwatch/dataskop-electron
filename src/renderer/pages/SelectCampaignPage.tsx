/**
 * Load config from server and optionally select a campaign configuration.
 *
 * @module
 */
import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getActiveCampaigns } from "renderer/lib/networking";
import { providerInfo } from "renderer/providers/info";
import { useConfig, useNavigation, useScraping } from "../contexts";

const SelectCampaignPage = (): JSX.Element => {
  const {
    state: { availableCampaigns },
    dispatch,
  } = useScraping();

  const { forceProvider }: { forceProvider: string } = useParams();

  const {
    state: {
      platformUrl,
      seriousProtection,
      updateCheckDone,
      userConfig,
      isPlaywrightTesing,
    },
    sendEvent,
  } = useConfig();

  const { dispatch: navDispath } = useNavigation();
  const history = useHistory();

  const handleCampaignChange = (campaign: any) => {
    // Important to push first new state and *then* dispatching the new campaigns.
    // The base layout is updated when the campaign changes and this causes
    // a re-render of this page.
    history.push(
      providerInfo[campaign.config.provider].navigation[
        campaign.config.navigation
      ].pages[0].path,
    );

    dispatch({
      type: "set-campaign",
      campaign,
    });

    navDispath({
      type: "set-navigation-by-provider",
      provider: campaign.config.provider,
      navSlug: campaign.config.navigation,
    });
  };

  const handleCampaignClick = (index: number) => {
    const campaign = availableCampaigns[index];
    handleCampaignChange(campaign);
  };

  const setActiveCampaign = async () => {
    if (platformUrl == null || userConfig == null) return;

    // Wait until the update check is completed or monitoring step active. Not
    // active for dev and testing.
    if (
      !isPlaywrightTesing && // testing
      !module.hot && // dev
      !userConfig.monitoring &&
      !updateCheckDone
    ) {
      window.electron.log(
        `Not fetching active campaings from backend yet. Monitoring:${userConfig.monitoring} UpdateCheckDone:${updateCheckDone}`,
      );
      return;
    }

    try {
      const campaigns = await getActiveCampaigns(
        platformUrl,
        seriousProtection,
      );

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

      dispatch({
        type: "set-available-campaigns",
        availableCampaigns: filteredCampaigns,
      });

      sendEvent(null, "successfully fetched remote config");
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
