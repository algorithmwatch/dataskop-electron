import { faAngleLeft } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import VisualizationWrapper from '../components/VisualizationWrapper';
import { useNavigation } from '../contexts/navigation';

export default function VisualizationMyData(): JSX.Element {
  const { getCurrentPage } = useNavigation();
  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      theme: 'link',
      startIcon: faAngleLeft,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getCurrentPage('path'));
      },
    },
  ];

  return (
    <>
      <VisualizationWrapper name="mydata" />
      <FooterNav items={footerNavItems} />
    </>
  );
}
