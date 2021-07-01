import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import VisualizationWrapper from '../components/VisualizationWrapper';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function VisualizationAutoplayChainPage() {
  const { getNextPage, getPreviousPage } = useNavigation();

  const {
    state: { isScrapingFinished },
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
      disabled: !isScrapingFinished,
      tippyOptions: !isScrapingFinished
        ? {
            content: 'Bitte warten Sie, bis das Scraping beendet ist.',
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
      <VisualizationWrapper name="autoplaychain" />
      <FooterNav items={footerNavItems} />
    </>
  );
}
