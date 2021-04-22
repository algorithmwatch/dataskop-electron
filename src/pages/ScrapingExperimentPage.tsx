import React, { useState } from 'react';
import Scraping from '../components/scraping/Scraping';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';
import SlideBase from '../layout/SlideBase';

export default function ScrapingExperimentPage(): JSX.Element {
  const [sessionId, setSessionId] = useState(null);

  const {
    state: { scrapingConfig },
  } = useConfig();

  const onlyExperimentScraper = {
    ...scrapingConfig,
    procedureConfig: {
      ...scrapingConfig.procedureConfig,
      personalScrapers: [],
    },
  };

  const footerNav =
    sessionId !== null
      ? [
          {
            label: 'weiter zu Visualisierung',
            clickHandler: (x) =>
              x.push(routes.RESULTS_DETAILS.replace(':sessionId', sessionId)),
          },
        ]
      : [];

  return (
    <SlideBase footerNav={footerNav}>
      <Scraping
        scrapingConfig={onlyExperimentScraper}
        onDone={(x) => setSessionId(x)}
      />
    </SlideBase>
  );
}
