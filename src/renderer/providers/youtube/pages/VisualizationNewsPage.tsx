import { faAngleLeft, faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from 'renderer/components/FooterNav';
import { useNavigation } from 'renderer/contexts/navigation';
import VisualizationWrapper from '../components/VisualizationWrapper';

export default function VisualizationNewsPage() {
  const { getNextPage, getPreviousPage } = useNavigation();

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
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      <VisualizationWrapper name="newstop5" />
      <FooterNav items={footerNavItems} />
    </>
  );
}
