import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { PerfectArrow } from '../components/PerfectArrow';
import routes from '../constants/routes.json';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function MyDataHintPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { demoMode },
  } = useScraping();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      theme: 'link',
      startIcon: faAngleLeft,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getPreviousPage('path'));
      },
    },
    {
      label: 'Weiter',
      endIcon: faAngleRight,
      disabled: demoMode,
      tippyOptions: demoMode
        ? {
            content: 'Die Demo ist hier zu Ende',
            theme: 'process-info',
            placement: 'left',
          }
        : undefined,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      <ContentWrapper centerY>
        <div className="absolute top-0 right-16">
          <PerfectArrow
            p1={{ x: 110, y: 200 }}
            p2={{ x: 240, y: 80 }}
            width={300}
            height={225}
            options={{ bow: 0.14 }}
          />
          <div className="absolute bottom-0 -left-48 w-72 text-right">
            Klicke hier, um Dir deine Daten anzeigen zu lassen.
          </div>
        </div>
        {demoMode && (
          <div className="text-center space-y-4 max-w-md">
            <div className="hl-3xl">Die Demo ist hier zu Ende</div>
            <p>
              Wenn Du Dataskop mit einer Datenspende unterstützen möchtest,{' '}
              <Link
                to={routes.ONBOARDING_1}
                className="underline hover:no-underline text-blue-600"
              >
                melde Dich bitte mit deinem YouTube-Konto an
              </Link>
              .
            </p>
            <p>
              Neuigkeiten über DataSkop gibt es{' '}
              <a
                href="https://twitter.com/dataskop_net"
                target="_blank"
                className="underline hover:no-underline text-blue-600"
                rel="noreferrer"
              >
                bei Twitter
              </a>{' '}
              und im Newsletter von AW.
            </p>
          </div>
        )}
      </ContentWrapper>
      <FooterNav items={footerNavItems} />
    </>
  );
}
