import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav from '../components/FooterNav';
import routes from '../constants/routes.json';
import { useScraping } from '../contexts';

export default function ScrapingProfilePage(): JSX.Element {
  const {
    state: { sessionId },
    dispatch,
  } = useScraping();

  const footerNavItems =
    sessionId !== null
      ? [
          {
            label: 'weiter zu Visualisierung',
            clickHandler(history: RouteComponentProps['history']) {
              history.push(
                routes.VISUALIZATION_PROFILE.replace(':sessionId', sessionId),
              );
            },
          },
        ]
      : [];

  // enable and disable scraping window
  useEffect(() => {
    dispatch({ type: 'set-is-attached', isAttached: true });
    // return () => dispatch({ type: 'set-is-attached', isAttached: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div>Bro, sup!</div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
