/**
 * Load config from server and optionally select a campaign configuration.
 *
 * @module
 */
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getActiveCampaigns } from "renderer/lib/networking";
import { localActiveCampaings, providerInfo } from "renderer/providers/info";
import { useConfig, useNavigation, useScraping } from "../contexts";
import { addStatusReset } from "../lib/status";
import { Campaign } from "../providers/types";
import ContentPage from "./ContentPage";

const SelectCampaignPage = (): JSX.Element => {
  const {
    state: { campaign },
    dispatch,
  } = useScraping();

  const {
    state: {
      platformUrl,
      seriousProtection,
      updateCheckDone,
      userConfig,
      autoSelectCampaign,
      isDevelopment,
    },
    sendEvent,
  } = useConfig();

  const { dispatch: navDispath } = useNavigation();
  const history = useHistory();
  const { forceProvider }: { forceProvider: string } = useParams();

  const [campaignChoices, setCampaignChoices] = useState<Campaign[]>([]);

  const handleCampaignChange = async (newCampaign: any) => {
    // Always add a new status reset when changing campaigns
    await addStatusReset();

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
    const clickedCampaign = campaignChoices[index];
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

      if (isDevelopment) campaigns.push(...localActiveCampaings);

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
      setCampaignChoices(filteredCampaigns);
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

  if (campaignChoices.length === 0) return <div />;

  const activeCampaign = campaignChoices.filter((x) => x.id === campaign?.id);
  const otherCampaigns = campaignChoices.filter((x) => x.id !== campaign?.id);

  return (
    <ContentPage title="Wähle eine Untersuchung">
      <>
        <div className="mx-auto flex flex-col h-full text-center">
          <div className="space-x-4">
            {otherCampaigns.map((x, i) => (
              <button
                key={x.id}
                type="button"
                className="p-5 mt-5 border-solid border-4 border-turquoise-600"
                onClick={() => handleCampaignClick(i)}
              >
                <div className="hl-xl">{x.title}</div>
                <div>{x.description}</div>
              </button>
            ))}
          </div>
        </div>
        {activeCampaign.length && (
          <h3 className="font-semibold">Aktuelle Auswahl</h3>
        )}
        <div className="mx-auto flex flex-col h-full text-center">
          <div className="space-x-4">
            {activeCampaign.map((x, i) => (
              <button
                key={x.id}
                type="button"
                className="p-5 border-solid border-4 border-sky-600 hover:cursor-default"
              >
                <div className="hl-xl">{x.title}</div>
                <div>{x.description}</div>
              </button>
            ))}
          </div>
        </div>
      </>
    </ContentPage>
  );
};

export default SelectCampaignPage;
