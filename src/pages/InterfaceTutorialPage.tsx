import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function InterfaceTutorialPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { isScrapingStarted, isUserLoggedIn },
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
    if (isUserLoggedIn && !isScrapingStarted) {
      dispatch({ type: 'set-scraping-started', isScrapingStarted: true });
    }
  }, []);

  return (
    <>
      <div>
        {/* <div className="absolute inset-0"> */}
        {/* ScrapingProgressbar */}
        {/* <div className="absolute top-0 right-0 flex">
            <PerfectArrow
              p1={{ x: 30, y: 170 }}
              p2={{ x: 150, y: 80 }}
              width={200}
              height={180}
            />
            <div className="absolute top-44 -left-12 w-72">
              Wenn DataSkop Daten erfasst, erscheint dieser Ladebalken. Per
              Klick kannst Du dabei zuschauen.
            </div>
          </div> */}
        {/* <div className="absolute top-0 right-0">
            <PerfectArrow
              p1={{ x: 100, y: 450 }}
              p2={{ x: 400, y: 80 }}
              width={450}
              height={500}
              options={{ flip: true }}
            />
            <div className="absolute bottom-0 left-0 w-72">
              Im Menü kannst Du mehr zu den Hintergründen von DataSkop erfahren.
            </div>
          </div> */}
        {/* </div> */}
        <div className="p-6 max-w-lg mx-auto mb-10 text-center">
          <div>
            <div className="text-xl font-medium">Interface Tutorial</div>
            <p>Hier kommt das Interface-Tutorial</p>
            {/* <p className="text-yellow-1200">
            Hello and welcome to this early development version of DataSkop.
          </p> */}
          </div>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
