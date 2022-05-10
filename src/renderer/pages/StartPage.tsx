/**
 * Start screen and fetch campaign configuration from the platform.
 *
 * @module
 */
import { faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { localActiveCampaings } from 'renderer/providers';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig, useNavigation, useScraping } from '../contexts';
import { getActiveCampaigns } from '../lib/utils/networking';
import awlogo from '../static/images/logos/aw-logo.png';
import bmbflogo from '../static/images/logos/bmbf-logo.png';
import dslogo from '../static/images/logos/dslogo.svg';
import enslogo from '../static/images/logos/ens-logo.png';
import fhplogo from '../static/images/logos/fhp-logo.png';
import mplogo from '../static/images/logos/mp-logo.png';
import uplogo from '../static/images/logos/up-logo.png';

export default function StartPage(): JSX.Element {
  const {
    state: { platformUrl, seriousProtection },
    sendEvent,
  } = useConfig();
  const { getNextPage, dispatch: navDispath } = useNavigation();
  const { dispatch } = useScraping();

  const [disableNextBtn, setDisableNextBtn] = useState(true);

  const setActiveCampaign = async () => {
    if (platformUrl == null) return;

    try {
      const campaigns = (
        await getActiveCampaigns(platformUrl, seriousProtection)
      ).concat(localActiveCampaings);

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
          skipCampaignSelection: true,
        });
      }

      sendEvent(null, 'successfully fetched remote config');

      setTimeout(() => setDisableNextBtn(false), 100);
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
      disabled: disableNextBtn,
      // size: 'large',
      endIcon: faAngleRight,
      classNames: 'mx-auto',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      <div className="mx-auto flex flex-col h-full">
        <div className="flex-grow flex items-center max-h-96">
          <img src={dslogo} alt="Dataskop Logo" className="w-80 mx-auto" />
        </div>
        <div className="bg-yellow-100">
          <div className="text-center">
            <div className="font-bold mb-3">Partner:</div>
            <div className="flex flex-wrap items-center justify-center mb-5 max-w-xl">
              <img
                src={awlogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
              <img
                src={enslogo}
                alt=""
                className="mx-3 py-1 block w-20 h-auto"
              />
              <img
                src={uplogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
              <img
                src={fhplogo}
                alt=""
                className="mx-3 py-1 block w-48 h-auto"
              />
              <img
                src={mplogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold">Gefördert durch:</div>
            <img src={bmbflogo} alt="" className="block w-52 mx-auto -mt-1" />
          </div>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
