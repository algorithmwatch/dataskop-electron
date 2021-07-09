import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
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
            content: 'Demo ist hier zu Ende',
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
      <div className="p-6 max-w-lg mx-auto mb-10 text-center">
        <div>
          <div className="text-xl font-medium">My Data Hint</div>
          {/* <p className="text-yellow-1200">
            Hello and welcome to this early development version of DataSkop.
          </p> */}
          {demoMode && (
            <div>Demo Mode Junge, probier es noch mal mit echten Daten</div>
          )}
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
