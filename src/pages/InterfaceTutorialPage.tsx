import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { PerfectArrow } from '../components/PerfectArrow';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function InterfaceTutorialPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { isScrapingStarted, isUserLoggedIn, demoMode },
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
      classNames: 'ml-auto',
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
        <div className="absolute top-48 left-32 hl-4xl text-yellow-1500">
          Interface-Erklärung
        </div>
        {!demoMode && (
          <div className="absolute top-0 right-48">
            <PerfectArrow
              p1={{ x: 30, y: 170 }}
              p2={{ x: 150, y: 80 }}
              width={200}
              height={180}
            />
            <div className="absolute top-36 -left-72 w-80">
              Wenn DataSkop Daten erfasst, erscheint dieser Ladebalken. Per
              Klick kannst Du dabei zuschauen.
            </div>
          </div>
        )}
        <div className="absolute top-0 right-0">
          <PerfectArrow
            p1={{ x: 290, y: 450 }}
            p2={{ x: 415, y: 80 }}
            width={450}
            height={500}
            options={{ flip: true, bow: 0.1 }}
          />
          <div className="absolute bottom-0 left-6 w-72">
            Im Menü kannst Du mehr zu den Hintergründen von DataSkop erfahren.
          </div>
        </div>
        <div className="absolute bottom-8 left-56">
          <PerfectArrow
            p1={{ x: 25, y: 5 }}
            p2={{ x: 25, y: 150 }}
            width={50}
            height={170}
          />
          <div className="absolute -top-14 -left-28 w-72 text-center">
            Diese Leiste zeigt an, wo Du Dich im Ablauf von DataSkop befindest.
          </div>
        </div>

        {/* <div className="p-6 max-w-lg mx-auto mb-10 text-center">
          <div>
            <div className="text-xl font-medium">Interface Tutorial</div>
            <p>Hier kommt das Interface-Tutorial</p>
          </div>
        </div> */}
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
