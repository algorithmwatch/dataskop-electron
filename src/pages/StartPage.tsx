import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import { History } from 'history';
import React from 'react';
import routes from '../constants/routes.json';
import SlideBase from '../layout/SlideBase';
import logo from '../static/logos/dataskop_logo.png';

const footerNav = [
  {
    label: 'Zurück',
    startIcon: faAngleLeft,
    classNames: '',
    disabled: true,
    clickHandler(history: History) {
      history.push(routes.EXPLANATION);
    },
  },
  {
    label: 'Testbutton2',
    size: 'large',
    startIcon: faAngleLeft,
    clickHandler(history: History) {
      history.push(routes.EXPLANATION);
    },
  },
  {
    label: 'Weiter',
    endIcon: faAngleRight,
    classNames: '',
    clickHandler(history: History) {
      history.push(routes.EXPLANATION);
    },
  },
];

export default function StartPage(): JSX.Element {
  return (
    <SlideBase footerNav={footerNav}>
      <>
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md mb-10">
          <div>
            <div className="text-xl font-medium text-black">Onboarding</div>
            <p className="text-gray-500">
              Hello and welcome to this early development version of DataSkop.
            </p>
          </div>
          <div>
            <img src={logo} style={{ width: '10rem' }} alt="Dataskop Logo" />
          </div>
        </div>
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
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
      </>
    </SlideBase>
  );
}
