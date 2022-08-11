/**
 * Load config from server and optionally select a campaign configuration.
 *
 * TODO: The base layout is also applied to this page. Should we use it? Or just
 * override it?
 * @module
 */
import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { getActiveCampaigns } from 'renderer/lib/networking';
import { localActiveCampaings, providerInfo } from 'renderer/providers/info';
import { useConfig, useNavigation, useScraping } from '../contexts';

export default function SelectCampaignPage(): JSX.Element {
  const {
    state: { availableCampaigns },
    dispatch,
  } = useScraping();

  const {
    state: { platformUrl, seriousProtection },
    sendEvent,
  } = useConfig();

  const { dispatch: navDispath } = useNavigation();
  const history = useHistory();

  const setActiveCampaign = async () => {
    if (platformUrl == null) return;

    try {
      const campaigns = localActiveCampaings.concat(
        await getActiveCampaigns(platformUrl, seriousProtection),
      );

      const filteredCampaigns = campaigns.filter(
        (x) => x.config && x.config.provider,
      );

      // only use campaigns that have a valid provider configuration
      dispatch({
        type: 'set-available-campaigns',
        availableCampaigns: filteredCampaigns,
      });

      // if a featured campaign exists, skip over the campaign selection page
      const featuredCampaigns = filteredCampaigns.filter((x) => x.featured);
      if (featuredCampaigns.length > 0) {
        dispatch({
          type: 'set-campaign',
          campaign: featuredCampaigns[0],
        });

        navDispath({
          type: 'set-navigation-by-provider',
          provider: featuredCampaigns[0].config.provider,
          navSlug: featuredCampaigns[0].config.navigation,
        });
      }

      sendEvent(null, 'successfully fetched remote config');
    } catch (error) {
      window.electron.log.error(
        'not able to set sraping config from remote',
        error,
      );
      sendEvent(null, 'failed to fetch remote config');
    }
  };

  useEffect(() => {
    setActiveCampaign();
  }, [platformUrl, seriousProtection]);

  const handleCampaignClick = (index: number) => {
    const campaign = availableCampaigns[index];

    // Important to push first new state and *then* dispatching the new campaigns.
    // The base layout is updated when the campaign changes and this causes
    // a re-render of this page.
    history.push(
      providerInfo[campaign.config.provider].navigation[
        campaign.config.navigation
      ].pages[0].path,
    );

    dispatch({
      type: 'set-campaign',
      campaign,
    });

    navDispath({
      type: 'set-navigation-by-provider',
      provider: campaign.config.provider,
      navSlug: campaign.config.navigation,
    });
  };

  return (
    <>
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
    </>
  );
}
