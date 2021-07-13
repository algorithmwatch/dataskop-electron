import { faTimes } from '@fortawesome/pro-solid-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import VisualizationWrapper from '../components/VisualizationWrapper';
import { useNavigation } from '../contexts/navigation';

export default function VisualizationMyData(): JSX.Element {
  const { getCurrentPage } = useNavigation();
  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Schließen',
      theme: 'link',
      startIcon: faTimes,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getCurrentPage('path'));
      },
    },
  ];

  // useEffect(() => {
  //   // set dark mode
  //   document.documentElement.classList.add('dark');
  //   return () => {
  //     document.documentElement.classList.remove('dark');
  //   };
  // }, []);

  return (
    <>
      <VisualizationWrapper name="mydata" />
      <FooterNav items={footerNavItems} />
    </>
  );
}
