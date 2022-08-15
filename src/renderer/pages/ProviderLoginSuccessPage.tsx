/**
 * Show page after successful login.
 *
 * @module
 */
import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import { useEffect } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import ContentWrapper from 'renderer/providers/youtube/components/ContentWrapper';
import { useConfig, useNavigation, useScraping } from '../contexts';
import FooterNav, {
  FooterNavItem,
} from '../providers/youtube/components/FooterNav';

export default function ProviderLoginSuccessPage(): JSX.Element {
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
      disabled: true,
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
      // hist.push(getNextPage('path'));
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    // if (isUserLoggedIn && !isScrapingStarted) {

    // start scraping
    dispatch({ type: 'set-scraping-started', started: true });
    // }
  }, []);

  return (
    <>
      <ContentWrapper centerY>
        <div className="space-y-10 text-center">
          <div>
            <div className="hl-4xl mb-6 text-center">Success</div>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo
              expedita delectus fugit aliquam qui! Nulla, quo. Autem pariatur
              velit repellendus ipsum corporis odit vero, facilis, possimus ex
              nam ratione delectus.
            </p>
          </div>
        </div>
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}
