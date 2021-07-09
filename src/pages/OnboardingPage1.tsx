import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button from '../components/Button';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig, useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function OnboardingPage1(): JSX.Element {
  const [showLoginWindow, setShowLoginWindow] = useState(false);
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { isUserLoggedIn, campaign },
    dispatch,
  } = useScraping();
  const hist = useHistory();
  const { sendEvent } = useConfig();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      startIcon: faAngleLeft,
      theme: 'link',
      clickHandler(history: RouteComponentProps['history']) {
        dispatch({ type: 'set-visible-window', visibleWindow: false });
        history.push(getPreviousPage('path'));
      },
    },
  ];

  useEffect(() => {
    if (isUserLoggedIn) {
      // hide login window
      dispatch({ type: 'set-visible-window', visibleWindow: false });
      // go to next page
      hist.push(getNextPage('path'));
    }
  }, [isUserLoggedIn]);

  return (
    <>
      <ContentWrapper centerY>
        <div className="space-y-10 text-center">
          <div>
            <div className="hl-4xl mb-6 text-center">Login bei YouTube</div>
            <p>
              Als Erstes möchten wir Dich bitten, Dich bei YouTube (YT)
              anzumelden. Wir speichern Dein Passwort nicht.
            </p>
            <div className="mt-4">
              <Button
                onClick={() => {
                  setShowLoginWindow(true);
                  dispatch({ type: 'set-is-attached', isAttached: true });
                  sendEvent(campaign, 'clicked start scraping', {});
                }}
              >
                Anmelden
              </Button>
            </div>
          </div>
          <div>
            <div className="hl-xl mb-4">Kein YouTube-Konto?</div>
            <p>
              Wenn Du Dich nicht einloggen möchtest oder kein YT-Konto hast,
              kannst Du mit einem „Demo-Datensatz“ fortfahren. Wir fragen Dich
              am Ende noch einmal, ob Du nicht doch Daten spenden könntest, um
              unsere Untersuchung zu unterstützen.
            </p>
            <div className="mt-4">
              <Button
                onClick={() => {
                  sendEvent(campaign, 'clicked use demo data', {});
                }}
              >
                Mit Demodaten fortfahren
              </Button>
            </div>
          </div>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}
