import { faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import routes from '../router/constants.json';

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
      console.warn('test', routes);
      history.push(routes.EXPLANATION);
      console.warn('test2', this);
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

export default function StartPage(): JSX.Element {
  return (
    <>
      <div className="p-6 max-w-lg mx-auto mb-10 text-center">
        <div>
          <div className="text-xl font-medium">Onboarding</div>
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

      <FooterNav items={footerNavItems} />
    </>
    // <SlideBase footerNav={footerNav}>
    // </SlideBase>
  );
}
