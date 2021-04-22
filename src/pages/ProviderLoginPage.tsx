import React, { useState } from 'react';
import Scraping from '../components/scraping/Scraping';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';
import SlideBase from '../layout/SlideBase';

export default function ProviderLoginPage(): JSX.Element {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const {
    state: { scrapingConfig },
  } = useConfig();

  const footerNav = isLoggedIn
    ? [
        {
          label: 'go to profile scraping',
          clickHandler: (x) => x.push(routes.SCRAPING_PROFILE),
        },
      ]
    : [];

  return (
    <SlideBase footerNav={footerNav}>
      {!isLoggedIn && <div>Please login to continue</div>}
      {!isLoggedIn && (
        <Scraping
          scrapingConfig={scrapingConfig}
          onLogin={() => setLoggedIn(true)}
        />
      )}
      {isLoggedIn && <div>You are logged in. Let's go!</div>}
    </SlideBase>
  );
}
