import { faAngleRight } from '@fortawesome/pro-solid-svg-icons';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useConfig } from '../contexts';
import { useNavigation } from '../contexts/navigation';
import bmbflogo from '../static/images/logos/bmbf-logo.png';

export default function SelectCampaignPage(): JSX.Element {
  const {
    state: { platformUrl, seriousProtection },
    sendEvent,
  } = useConfig();

  const { getNextPage } = useNavigation();



  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Weiter',
      // size: 'large',
      endIcon: faAngleRight,
      classNames: 'mx-auto',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
  ];

  return (
    <>
      <div className="mx-auto flex flex-col h-full">
          <div className="text-center">
            <div className="font-bold">Gefördert durch:</div>
            <img src={bmbflogo} alt="" className="block w-52 mx-auto -mt-1" />
          </div>
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
