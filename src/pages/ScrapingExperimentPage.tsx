import React, { useState } from 'react';
import Scraping from '../components/scraping/Scraping';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';
import SlideBase from '../layout/SlideBase';

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

  const footerNav =
    sessionId !== null
      ? [
          {
            label: 'weiter zu Visualisierung',
            clickHandler: (x) =>
              x.push(
                routes.VISUALIZATION_EXPERIMENT.replace(
                  ':sessionId',
                  sessionId,
                ),
              ),
          },
        ]
      : [];

  return (
    <SlideBase footerNav={footerNav}>
      <Scraping
        isInteractive={false}
        scrapingConfig={onlyExperimentScraper}
        onDone={(x) => setSessionId(x)}
      />
    </SlideBase>
  );
}
