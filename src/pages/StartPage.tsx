import { faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig, useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';
import awlogo from '../static/images/logos/aw-logo.png';
import bmbflogo from '../static/images/logos/bmbf-logo.png';
import dslogo from '../static/images/logos/dslogo.svg';
import enslogo from '../static/images/logos/ens-logo.png';
import fhplogo from '../static/images/logos/fhp-logo.png';
import mplogo from '../static/images/logos/mp-logo.png';
import uplogo from '../static/images/logos/up-logo.png';
import { getActiveCampaigns } from '../utils/networking';

export default function StartPage(): JSX.Element {
  const {
    state: { platformUrl, seriousProtection },
    sendEvent,
  } = useConfig();

  const { getNextPage } = useNavigation();

  const { dispatch } = useScraping();

  const setActiveCampaign = async () => {
    if (platformUrl == null) return;

    try {
      const cams = await getActiveCampaigns(platformUrl, seriousProtection);
      const remoteCampaign = cams[0];

      if (remoteCampaign == null) return;

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { scraping_config, id, title, description } = remoteCampaign;
      const campaign = { id, title, description };
      dispatch({
        type: 'set-scraping-config',
        scrapingConfig: scraping_config,
        campaign,
      });

      sendEvent(campaign, 'successfully fetched remote config', {});
    } catch (error) {
      console.error('not able to set sraping config from remote');
      console.log(error);
      sendEvent(null, 'failed to fetch remote config', {});
    }
  };

  useEffect(() => {
    setActiveCampaign();
  }, []);

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Weiter',
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
