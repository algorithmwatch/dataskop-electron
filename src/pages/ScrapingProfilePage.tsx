import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav from '../components/FooterNav';
import Scraping from '../components/scraping/ScrapingManager';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';

export default function ScrapingProfilePage(): JSX.Element {
  const [sessionId, setSessionId] = useState(null);

  const {
    state: { scrapingConfig },
  } = useConfig();

  const onlyProfileScraper = {
    ...scrapingConfig,
    procedureConfig: {
      ...scrapingConfig.procedureConfig,
      seedVideosDynamic: [],
      seedVideosFixed: [],
    },
  };

  const footerNavItems =
    sessionId !== null
      ? [
          {
            label: 'weiter zu Visualisierung',
            clickHandler(history: RouteComponentProps['history']) {
              history.push(
                routes.VISUALIZATION_PROFILE.replace(':sessionId', sessionId),
              );
            },
          },
        ]
      : [];

  return (
    <>
      <Scraping
        scrapingConfig={onlyProfileScraper}
        disableInput
        hideControls
        autostart
        onDone={(x) => setSessionId(x)}
      />
      <FooterNav items={footerNavItems} />
    </>
  );
}
