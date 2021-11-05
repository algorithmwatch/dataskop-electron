import { faAngleLeft } from '@fortawesome/pro-solid-svg-icons';
import { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button from 'renderer/components/Button';
import ContentWrapper from 'renderer/components/ContentWrapper';
import FooterNav, { FooterNavItem } from 'renderer/components/FooterNav';
import routes from 'renderer/constants/routes.json';
import { useConfig, useNavigation, useScraping } from 'renderer/contexts';

export default function OnboardingPage1(): JSX.Element {
  const [_showLoginWindow, setShowLoginWindow] = useState(false);
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

  useEffect(() => dispatch({ type: 'set-demo-mode', demoMode: false }), []);

  return (
    <>
      <ContentWrapper centerY>
        <div className="space-y-10 text-center">
          <div>
            <div className="hl-4xl mb-6 text-center">Login bei YouTube</div>
            <p>
              Als Erstes möchten wir dich bitten, dich bei YouTube (YT)
              anzumelden. Das geht mit deinem Google-/GMail-Konto. Wir speichern
              die Login-Informationen nicht. Ggf. musst du den Login in deinem
              Google-Mail-Konto bestätigen. du musst mind. 18 Jahre alt sein, um
              Daten an uns spenden zu können.
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
              Wenn du dich nicht einloggen möchtest oder kein YT-Konto hast,
              kannst du mit einem „Demo-Datensatz“ fortfahren. Wir fragen dich
              am Ende noch einmal, ob du nicht doch Daten spenden könntest, um
              unsere Untersuchung zu unterstützen.
            </p>
            <div className="mt-4">
              <Button
                onClick={() => {
                  dispatch({ type: 'set-demo-mode', demoMode: true });
                  sendEvent(campaign, 'clicked use demo data', {});
                  hist.push(routes.ONBOARDING_2);
                }}
              >
                Demo starten
              </Button>
            </div>
          </div>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}
