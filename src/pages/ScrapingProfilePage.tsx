import React, { useState } from 'react';
import Scraping from '../components/scraping/Scraping';
import { useConfig } from '../contexts/config';
import SlideBase from '../layout/SlideBase';
import routes from '../router/constants.json';

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

  const footerNav =
    sessionId !== null
      ? [
          {
            label: 'weiter zu Visualisierung',
            clickHandler: (x) =>
              x.push(
                routes.VISUALIZATION_PROFILE.replace(':sessionId', sessionId),
              ),
          },
        ]
      : [];

  return (
    <SlideBase footerNav={footerNav}>
      <Scraping
        scrapingConfig={onlyProfileScraper}
        disableInput
        hideControls
        autostart
        onDone={(x) => setSessionId(x)}
      />
    </SlideBase>
  );
}
