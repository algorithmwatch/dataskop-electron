/**
 * Load config from server and optionally select a campaign configuration.
 *
 * TODO: The base layout is also applied to this page. Should we use it? Or just
 * override it?
 * @module
 */
import { faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { getActiveCampaigns } from 'renderer/lib/networking';
import { localActiveCampaings, providerInfo } from 'renderer/providers';
import { useConfig, useNavigation, useScraping } from '../contexts';
import FooterNav, {
  FooterNavItem,
} from '../providers/youtube/components/FooterNav';

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

  const [chosenIndex, setChosenIndex] = useState(0);

  const setActiveCampaign = async () => {
    if (platformUrl == null) return;

    try {
      const campaigns = localActiveCampaings.concat(
        await getActiveCampaigns(platformUrl, seriousProtection),
      );

      const availableCampaigns = campaigns.filter(
        (x) => x.config && x.config.provider,
      );

      // only use campaigns that have a valid provider configuration
      dispatch({
        type: 'set-available-campaigns',
        availableCampaigns,
      });

      // if a featured campaign exists, skip over the campaign selection page
      const featuredCampaigns = availableCampaigns.filter((x) => x.featured);
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
      console.error('not able to set sraping config from remote');
      console.log(error);
      sendEvent(null, 'failed to fetch remote config');
    }
  };

  useEffect(() => {
    setActiveCampaign();
  }, [platformUrl, seriousProtection]);

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Weiter',
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps['history']) {
        const campaign = availableCampaigns[chosenIndex];

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
      },
    },
  ];

  return (
    <>
      <div className="mx-auto flex flex-col h-full">
        <div className="hl-4xl mb-6 text-center">
          Wähle eine Untersuchung aus
        </div>
        <div className="text-center">
          {availableCampaigns.map((x, i) => {
            const border =
              i === chosenIndex
                ? 'border-solid border-4 border-yellow-700'
                : 'border-solid border-4 border-yellow-300';
            return (
              <div
                key={i}
                className={`${border} p-5 mt-5 cursor-pointer`}
                onClick={() => setChosenIndex(i)}
              >
                <div className="hl-xl">{x.title}</div>
                <div>{x.description}</div>
              </div>
            );
          })}
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
