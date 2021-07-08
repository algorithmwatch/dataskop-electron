import {
  faBars,
  faChartPieAlt,
  faInfoCircle,
  faPaperPlane
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/modal/Modal';
import ProcessIndicator from '../components/ProcessIndicator';
import ScrapingProgressBar from '../components/ScrapingProgressBar';
import Sidebar from '../components/Sidebar';
import routes from '../constants/routes.json';
import { useNavigation } from '../contexts';
import { useModal } from '../contexts/modal';
import logo from '../static/images/logos/dslogo.svg';


export default function Base({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [sectionKey, setSectionKey] = useState('');
  const { pathname } = useLocation();
  const {
    state: { pageIndex, sections },
    dispatch: dispatchNavigation,
    getCurrentPage,
    getPageIndexByPath,
  } = useNavigation();
  const { dispatch: dispatchModal } = useModal();

  const sidebarMenu = [
    {
      label: 'Menüpunkt 1',
      icon: faChartPieAlt,
      onClick: () => {
        console.warn('asdasd');
        dispatchModal({
          type: 'set-modal-options',
          options: { isOpen: true, componentName: 'about' },
        });
      },
    },
    {
      label: 'Menüpunkt 2',
      icon: faPaperPlane,
    },
    {
      label: 'Menüpunkt 3',
      icon: faInfoCircle,
    },
  ];

  // read config for current route
  useEffect(() => {
    const nextPageIndex = getPageIndexByPath(pathname);

    // set page index
    if (nextPageIndex !== -1) {
      dispatchNavigation({ type: 'set-page-index', pageIndex: nextPageIndex });
    }
  }, [pathname]);

  // set dark mode, set process indicator
  useEffect(() => {
    const page = getCurrentPage();

    // set dark mode
    if (page.isDarkMode) {
      if (page.isDarkMode === true) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // set processIndicator
    if (typeof page.sectionKey !== 'undefined') {
      if (page.sectionKey === null) {
        setSectionKey('');
      } else {
        setSectionKey(page.sectionKey);
      }
    }
  }, [pageIndex]);

  return (
    <div className="relative flex flex-col h-screen justify-between">
      <Modal />
      <header
        className={classNames('flex items-center py-4 px-6 z-20', {
          'opacity-0': pathname === routes.START,
        })}
      >
        <div>
          <img src={logo} style={{ width: '8rem' }} alt="Dataskop Logo" />
        </div>
        <div className="flex items-center ml-auto mr-6">
          <div className="mr-4">
            <ScrapingProgressBar />
          </div>

          {/* MyData vault */}
          <div>
            <Button
              key="my-data"
              size="small"
              theme="blue"
              onClick={() => false}
            >
              Meine Daten
            </Button>
          </div>
        </div>
        <div>
          <button
            type="button"
            className="focus:outline-none text-yellow-800 hover:text-yellow-900"
            onClick={() => setMenuIsOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>
      </header>

      <Sidebar
        menuItems={sidebarMenu}
        isOpen={menuIsOpen}
        onIsOpenChange={(val: boolean) => setMenuIsOpen(val)}
      />

      {/*  h-full hides the debug button for long pages */}
      <main className="flex flex-grow flex-col justify-between overflow-auto pt-4">
        {children}
      </main>

      <footer>
        <ProcessIndicator steps={sections} currentStep={sectionKey} />
      </footer>
    </div>
  );
}
