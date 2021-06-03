import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav from '../components/FooterNav';
import Scraping from '../components/scraping/Scraping';
import { useConfig } from '../contexts/config';
import routes from '../router/constants.json';

export default function ScrapingExperimentPage(): JSX.Element {
  const [sessionId, setSessionId] = useState<null | string>(null);

  const {
    state: { scrapingConfig },
  } = useConfig();

  const onlyExperimentScraper = {
    ...scrapingConfig,
    procedureConfig: {
      ...scrapingConfig.procedureConfig,
      profileScrapers: [],
    },
  };

  const footerNavItems =
    sessionId !== null
      ? [
          {
            label: 'weiter zu Visualisierung',
            clickHandler(history: RouteComponentProps['history']) {
              history.push(
                routes.VISUALIZATION_EXPERIMENT.replace(
                  ':sessionId',
                  sessionId,
                ),
              );
            },
          },
        ]
      : [];

  return (
    <>
      <Scraping
        disableInput
        hideControls
        autostart
        scrapingConfig={onlyExperimentScraper}
        onDone={(x) => setSessionId(x)}
      />
      <FooterNav items={footerNavItems} />
    </>
  );
}
