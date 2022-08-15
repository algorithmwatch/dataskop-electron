/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * Login to provider.
 *
 * @module
 */
import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import { Button } from '@material-ui/core';
import { useEffect } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import DropFile from 'renderer/components/DropFile';
import ContentWrapper from 'renderer/providers/youtube/components/ContentWrapper';
import { useConfig, useNavigation, useScraping } from '../contexts';
import FooterNav, {
  FooterNavItem,
} from '../providers/youtube/components/FooterNav';

export default function ProviderLoginPage(): JSX.Element {
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

      // dispatch({ type: 'set-visible-window', visibleWindow: false });

      // go to next page
      hist.push(getNextPage('path'));
    }
  }, [isUserLoggedIn]);

  return (
    <>
      <ContentWrapper centerY>
        <div className="space-y-10 text-center">
          <div>
            <div className="hl-4xl mb-6 text-center">Login bei Provider</div>
            <div className="mt-4">
              <Button
                onClick={() => {
                  dispatch({
                    type: 'set-attached',
                    attached: true,
                    visible: true,
                  });
                  sendEvent(campaign, 'clicked start scraping');
                }}
              >
                Anmelden
              </Button>
            </div>
            <Button
              onClick={() => {
                window.electron.ipc.invoke('scraping-clear-storage');
                // dispatch({ type: 'reset-scraping' });
              }}
            >
              Reset storage
            </Button>
          </div>
          <div>
            <div className="hl-xl mb-4">Daten importieren</div>
            <DropFile />
          </div>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}
