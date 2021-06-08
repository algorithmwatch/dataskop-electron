import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Button from '../components/Button';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import Scraping from '../components/scraping/ScrapingManager';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';

export default function ProviderLoginPage(): JSX.Element {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [showLoginWindow, setShowLoginWindow] = useState(false);
  const {
    state: { scrapingConfig },
  } = useConfig();
  const footerNavItems: FooterNavItem[] = [];

  if (!isLoggedIn) {
    footerNavItems.push({
      label: 'Zurück',
      startIcon: faAngleLeft,
      theme: 'link',
      clickHandler(history: RouteComponentProps['history']) {
        history.go(-1);
      },
    });
  } else {
    footerNavItems.push({
      label: 'Weiter',
      size: 'large',
      classNames: 'mx-auto',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(routes.SCRAPING_EXPLANATION);
      },
    });
  }

  return (
    <>
      {!isLoggedIn && !showLoginWindow && (
        <>
          <h1 className="hl-4xl text-center mb-6">Bitte melden Sie sich an</h1>
          <p className="text-lg mx-auto mb-6">
            Bitte melden Sie sich mit Ihrem Google-Konto an.
          </p>
          <div className="mx-auto">
            <Button
              size="large"
              onClick={() => {
                setShowLoginWindow(true);
              }}
            >
              Anmelden
            </Button>
          </div>
        </>
      )}
      {showLoginWindow && (
        <Scraping
          fixedWindow
          scrapingConfig={scrapingConfig}
          onLogin={() => {
            setLoggedIn(true);
            setShowLoginWindow(false);
          }}
          hideControls
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
      <FooterNav items={footerNavItems} />
    </>
  );
}
