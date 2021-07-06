import { faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig, useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';
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
      <div className="p-6 max-w-lg mx-auto mb-10 text-center">
        <div>
          <div className="text-xl font-medium">Welcome</div>
          <p className="text-yellow-1200">
            Hello and welcome to this early development version of DataSkop.
          </p>
        </div>
      </div>
      <div className="p-6 max-w-lg mx-auto">
        <ul className="menu-list">
          <li>
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://algorithmwatch.org/en/project/dataskop/"
            >
              About DataSkop
            </a>
          </li>
        </ul>
      </div>
      {/* <RemoteScrapingConfig /> */}

      <FooterNav items={footerNavItems} />
    </>
  );
}
