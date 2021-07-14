import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import ContactContainer from '../components/ContactContaier';
import ContentWrapper from '../components/ContentWrapper';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import VisualizationWrapper from '../components/VisualizationWrapper';
import routes from '../constants/routes.json';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function MyDataPage(): JSX.Element {
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
      {demoMode ? (
        <ContentWrapper centerY>
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
            <ContactContainer />
          </div>
        </ContentWrapper>
      ) : (
        <VisualizationWrapper name="mydata" />
      )}
      <FooterNav items={footerNavItems} />
    </>
  );
}
