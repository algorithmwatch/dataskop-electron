import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav from '../../components/FooterNav';
import Scraping from '../../components/scraping/ScrapingManager';
import routes from '../../constants/routes.json';
import { useConfig } from '../../contexts/config';

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
              history.push({
                pathname: routes.VISUALIZATION_EXPERIMENT,
                state: { sessionId, type: 'newstop5' },
              });
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
