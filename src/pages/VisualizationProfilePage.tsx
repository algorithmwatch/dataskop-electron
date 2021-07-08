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
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
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
