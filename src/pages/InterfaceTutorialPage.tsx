import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function InterfaceTutorialPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { isScrapingStarted },
    dispatch,
  } = useScraping();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      startIcon: faAngleLeft,
      theme: 'link',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getPreviousPage('path'));
      },
    },
    {
      label: 'Weiter',
      // size: 'large',
      endIcon: faAngleRight,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  useEffect(() => {
    // start scraping
    if (!isScrapingStarted) {
      dispatch({ type: 'set-scraping-started', isScrapingStarted: true });
    }
  }, []);

  return (
    <>
      <div className="p-6 max-w-lg mx-auto mb-10 text-center">
        <div>
          <div className="text-xl font-medium">Interface Tutorial</div>
          {/* <p className="text-yellow-1200">
            Hello and welcome to this early development version of DataSkop.
          </p> */}
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
