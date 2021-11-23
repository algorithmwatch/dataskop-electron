import { faAngleLeft } from '@fortawesome/pro-solid-svg-icons';
import { useEffect } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button from 'renderer/components/Button';
import ContentWrapper from 'renderer/components/ContentWrapper';
import FooterNav, { FooterNavItem } from 'renderer/components/FooterNav';
import { useConfig, useNavigation, useScraping } from 'renderer/contexts';

export default function SelectDemoPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { campaign },
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

  useEffect(
    () => dispatch({ type: 'set-demo-mode', demoMode: false, demoData: null }),
    [],
  );

  return (
    <>
      <ContentWrapper centerY>
        <div className="space-y-10 text-center">
          <div>
            <div className="hl-xl mb-4">Wähle einen Demo-Datensatz aus</div>
            <p>
              Wenn du dich nicht einloggen möchtest oder kein YT-Konto hast,
              kannst du mit einem „Demo-Datensatz“ fortfahren. Wir fragen dich
              am Ende noch einmal, ob du nicht doch Daten spenden könntest, um
              unsere Untersuchung zu unterstützen.
            </p>

            {campaign?.config.demoData.map((demoData) => {
              return (
                <div className="mt-4" key={demoData.title}>
                  <Button
                    onClick={() => {
                      dispatch({
                        type: 'set-demo-mode',
                        demoMode: true,
                        demoData,
                      });
                      sendEvent(campaign, 'clicked use demo data');
                      hist.push(getNextPage('path'));
                    }}
                  >
                    {demoData.title}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}
