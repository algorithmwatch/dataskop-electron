import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Button from '../components/Button';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { goToUrl } from '../components/scraping/ipc';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';
import { providerToMeta } from '../providers';

export default function OnboardingPage2(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const [showLoginWindow, setShowLoginWindow] = useState(false);
  const {
    state: { isUserLoggedIn, scrapingConfig, isScrapingStarted },
    dispatch,
  } = useScraping();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      startIcon: faAngleLeft,
      theme: 'link',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getPreviousPage('path'));

        // logout user if logged in already
        if (isUserLoggedIn) {
          dispatch({ type: 'reset-scraping' });
          goToUrl(providerToMeta[scrapingConfig.provider].loginUrl, {
            clear: true,
          });
        }

        dispatch({ type: 'set-visible-window', visibleWindow: false });
      },
    },
  ];
  if (isUserLoggedIn) {
    footerNavItems.push({
      label: 'Weiter',
      size: 'large',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    });
  }

  useEffect(() => {
    if (isUserLoggedIn) {
      dispatch({ type: 'set-visible-window', visibleWindow: false });
    }
  }, [isUserLoggedIn]);

  return (
    <>
      {!isUserLoggedIn && !showLoginWindow && (
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
                dispatch({ type: 'set-is-attached', isAttached: true });
                dispatch({ type: 'set-visible-window', visibleWindow: true });
              }}
            >
              Anmelden
            </Button>
          </div>
        </>
      )}
      {isUserLoggedIn && (
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
