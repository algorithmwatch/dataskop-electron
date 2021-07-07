import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import VisualizationWrapper from '../components/VisualizationWrapper';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function VisualizationProfilePage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();

  const {
    state: {
      scrapingProgress: { step },
      isScrapingFinished,
      scrapingConfig,
    },
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
      // size: 'large',
      endIcon: faAngleRight,
      disabled: !isScrapingFinished,
      tippyOptions: !isScrapingFinished
        ? {
            content: 'Bitte warten Sie, bis alle Daten geladen sind.',
            theme: 'process-info',
            placement: 'left',
          }
        : undefined,
      clickHandler(history: RouteComponentProps['history']) {
        if (isScrapingFinished) {
          history.push(getNextPage('path'));
        }
      },
    },
  ];

  return (
    <>
      <VisualizationWrapper name="profile" />
      <FooterNav items={footerNavItems} />
    </>
  );
}
