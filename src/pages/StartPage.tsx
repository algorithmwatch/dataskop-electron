import { faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig, useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';
import awlogo from '../static/images/logos/aw-logo.png';
import bmbflogo from '../static/images/logos/bmbf-logo.png';
import dslogo from '../static/images/logos/dslogo.svg';
import enslogo from '../static/images/logos/ens-logo.png';
import hplogo from '../static/images/logos/fhp-logo.png';
import mplogo from '../static/images/logos/mp-logo.png';
import uplogo from '../static/images/logos/up-logo.png';
import { getActiveCampaigns } from '../utils/networking';

export default function StartPage(): JSX.Element {
  const {
    state: { platformUrl },
  } = useConfig();

  const { getNextPage } = useNavigation();

  const { dispatch } = useScraping();

  const setActiveCampaign = async () => {
    if (platformUrl == null) return;

    try {
      const cams = await getActiveCampaigns(platformUrl);
      const remoteCampaign = cams[0];

      if (remoteCampaign == null) return;

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { scraping_config, id, title, description } = remoteCampaign;
      dispatch({
        type: 'set-scraping-config',
        scrapingConfig: scraping_config,
        campaign: { id, title, description },
      });
    } catch (error) {
      console.error('not able to set sraping config from remote');
      console.log(error);
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
            <div className="font-bold">Partner:</div>
            <div className="flex flex-wrap items-center justify-center mb-8">
              <img src={enslogo} alt="" className="mx-2.5 block w-24 h-auto" />
              <img src={hplogo} alt="" className="mx-2.5 block w-52 h-auto" />
              <img src={awlogo} alt="" className="mx-2.5 block w-48 h-auto" />
              <img src={mplogo} alt="" className="mx-2.5 block w-44 h-auto" />
              <img src={uplogo} alt="" className="mx-2.5 block w-48 h-auto" />
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold">Gefördert durch:</div>
            <img src={bmbflogo} alt="" className="block w-52 mx-auto" />
          </div>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
