import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Button from '../components/Button';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig, useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function OnboardingPage2(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const [showLoginWindow, setShowLoginWindow] = useState(false);
  const {
    state: { isUserLoggedIn, campaign },
    dispatch,
  } = useScraping();

  const { sendEvent } = useConfig();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      startIcon: faAngleLeft,
      theme: 'link',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getPreviousPage('path'));
      },
    },
  ];
  if (isUserLoggedIn) {
    footerNavItems.push({
      label: 'Weiter',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
        dispatch({ type: 'set-visible-window', visibleWindow: false });
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
        <ContentWrapper centerY>
          <h1 className="hl-4xl text-center mb-6">Bitte melden Sie sich an</h1>
          {/* <p className="text-lg mx-auto mb-6">
            Bitte melden Sie sich mit Ihrem Google-Konto an.
          </p> */}
          <div className="flex flex-col items-center space-y-4">
            <Button
              size="large"
              onClick={() => {
                setShowLoginWindow(true);
                dispatch({ type: 'set-is-attached', isAttached: true });
                dispatch({ type: 'set-visible-window', visibleWindow: true });
                sendEvent(campaign, 'clicked start scraping', {});
              }}
            >
              Anmelden
            </Button>
            <Button
              size="large"
              onClick={() => {
                sendEvent(campaign, 'clicked use demo data', {});
              }}
            >
              Mit Demodaten fortfahren
            </Button>
          </div>
        </ContentWrapper>
      )}
      {isUserLoggedIn && (
        <ContentWrapper>
          <div className="hl-4xl text-center mb-6">Anmeldung erfolgreich</div>
          <div className="hl-2xl mb-6 text-center">
            Was passiert als Nächstes?
          </div>
          <div className="space-y-4">
            <p>
              Wir zeigen Dir eine Auswertung Deiner Sehgewohnheiten und lassen
              Dich drei Experimente durchführen. Dafür:
            </p>
            <ul className="list-disc pl-4">
              <li>liest DataSkop aus, welche YT-Kanäle Du abonniert hast</li>

              <li>
                erfasst die letzten 50 Videos, die Du geschaut hast (wenn Du
                diese Funktion aktiviert hast). Private Videos werden nicht
                erfasst.
              </li>

              <li>
                Für die später folgenden Experimente ruft DataSkop automatisiert
                einige Videos auf und liest die dazugehörigen empfohlenen Videos
                (recommendations) aus.
              </li>

              <li>
                Automatisiert werden einige Suchbegriffe in die YouTube-Suche
                eingegeben und die ersten zehn vorgeschlagenen Ergebnisse
                gespeichert.
              </li>

              <li>
                Dann loggt Dich DataSkop aus Deinem YT-Konto automatisch aus.
              </li>
            </ul>

            <p>
              Die dabei gesammelten Daten bleiben erst einmal auf Deinem Rechner
              und werden am Ende von Dir gespendet. Aber nur wenn Du dem
              zustimmst. Für das Spenden musst Du ein DataSkop-Konto anlegen –
              dafür brauchen wir nur Deine E-Mail-Adresse.
            </p>

            <p>
              Deine gespendeten Daten werden nie für kommerzielle Zwecke
              verwendet, sondern nur für Forschung und Journalismus. Du kannst
              sie später jederzeit löschen.
            </p>
          </div>
        </ContentWrapper>
      )}
      <FooterNav items={footerNavItems} />
    </>
  );
}
