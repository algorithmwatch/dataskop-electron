import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import { History } from 'history';
import React, { useState } from 'react';
import Button from '../components/Button';
import Scraping from '../components/scraping/Scraping';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';
import SlideBase from '../layout/SlideBase';

export default function ProviderLoginPage(): JSX.Element {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [showLoginWindow, setShowLoginWindow] = useState(false);
  const {
    state: { scrapingConfig },
  } = useConfig();
  const footerNav = [];

  if (!isLoggedIn) {
    footerNav.push({
      label: 'Zurück',
      startIcon: faAngleLeft,
      theme: 'link',
      clickHandler(history: History) {
        history.go(-1);
      },
    });
  } else {
    footerNav.push({
      label: 'Weiter',
      size: 'large',
      classNames: 'mx-auto',
      clickHandler: (history: History) =>
        history.push(routes.SCRAPING_EXPLANATION),
    });
  }

  return (
    <SlideBase footerNav={footerNav}>
      {!showLoginWindow && (
        <>
          <h1 className="hl-4xl text-center mb-6">Bitte melden Sie sich an</h1>
          <p className="text-lg mx-auto mb-6">
            Bitte melden Sie sich mit Ihrem Google-Konto an.
          </p>
          <div className="mx-auto">
            <Button
              size="large"
              clickHandler={() => {
                setShowLoginWindow(true);
                setLoggedIn(true);
              }}
            >
              Anmelden
            </Button>
          </div>
        </>
      )}
      {showLoginWindow && (
        <Scraping
          scrapingConfig={scrapingConfig}
          onLogin={() => setLoggedIn(true)}
          hideMute
        />
      )}
      {isLoggedIn && (
        <>
          <h1 className="hl-4xl text-center mb-6">Anmeldung erfolgreich</h1>
          <p className="text-lg mx-auto mb-6">
            Klicke auf "Weiter", um fortzufahren.
          </p>
        </>
      )}
    </SlideBase>
  );
}
