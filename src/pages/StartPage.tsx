import { faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import RemoteScrapingConfig from '../components/scraping/RemoteScrapingConfigSelect';
import { useNavigation } from '../contexts/navigation';

export default function StartPage(): JSX.Element {
  const { getNextPage } = useNavigation();

  const footerNavItems: FooterNavItem[] = [
    // {
    //   label: 'Zurück',
    //   startIcon: faAngleLeft,
    //   classNames: '',
    //   disabled: true,
    //   clickHandler(history: History) {
    //     history.push(routes.EXPLANATION);
    //   },
    // },
    {
      label: 'Weiter',
      // size: 'large',
      endIcon: faAngleRight,
      classNames: 'mx-auto',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getNextPage('path'));
      },
    },
    // {
    //   label: 'Weiter',
    //   endIcon: faAngleRight,
    //   // classNames: '',
    //   // theme: 'link',
    //   clickHandler(history: History) {
    //     history.push(routes.EXPLANATION);
    //   },
    // },
  ];

  return (
    <>
      <div className="p-6 max-w-lg mx-auto mb-10 text-center">
        <div>
          <div className="text-xl font-medium">Welcome</div>
          <p className="text-yellow-1200">
            Hello and welcome to this early development version of DataSkop.
          </p>
        </div>
      </div>
      <div className="p-6 max-w-lg mx-auto">
        <ul className="menu-list">
          <li>
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://algorithmwatch.org/en/project/dataskop/"
            >
              About DataSkop
            </a>
          </li>
        </ul>
      </div>
      <RemoteScrapingConfig />

      <FooterNav items={footerNavItems} />
    </>
  );
}
