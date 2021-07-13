/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  faBars,
  faFileContract,
  faInfoCircle,
  faPaperPlane,
  faUserSecret
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from '../components/modal/Modal';
import ProcessIndicator from '../components/ProcessIndicator';
import ScrapingProgressBar from '../components/ScrapingProgressBar';
import Sidebar from '../components/Sidebar';
import routes from '../constants/routes.json';
import { useConfig, useNavigation, useScraping } from '../contexts';
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
  const {
    state: { demoMode },
  } = useScraping();
  const [logoClicked, setLogoClicked] = useState(0);
  const {
    dispatch: dispatchConfig,
    state: { version },
  } = useConfig();
  const handleLogoClicked = () => {
    if (logoClicked > 3) {
      dispatchConfig({ type: 'show-advanced-menu' });
    } else setLogoClicked(logoClicked + 1);
  };
  const sidebarMenu = [
    {
      label: 'Über',
      icon: faInfoCircle,
      onClick: () => {
        dispatchModal({
          type: 'set-modal-options',
          options: { isOpen: true, componentName: 'about' },
        });
      },
    },
    {
      label: 'Kontakt',
      icon: faPaperPlane,
      onClick: () => {
        dispatchModal({
          type: 'set-modal-options',
          options: { isOpen: true, componentName: 'contact' },
        });
      },
    },
    // {
    //   label: 'FAQ',
    //   icon: faQuestionCircle,
    //   onClick: () => {
    //     dispatchModal({
    //       type: 'set-modal-options',
    //       options: { isOpen: true, componentName: 'faq' },
    //     });
    //   },
    // },
    {
      label: 'Datenspendevertrag',
      icon: faFileContract, // faFileSignatur
      onClick: () => {
        dispatchModal({
          type: 'set-modal-options',
          options: { isOpen: true, componentName: 'terms' },
        });
      },
    },
    {
      label: 'Datenschutz',
      icon: faUserSecret,
      onClick: () => {
        dispatchModal({
          type: 'set-modal-options',
          options: { isOpen: true, componentName: 'privacy' },
        });
      },
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
        className={classNames('flex items-center py-4 px-6 z-20 h-18', {
          'opacity-0': pathname === routes.START,
        })}
      >
        <div>
          <img
            src={logo}
            style={{ width: '8rem' }}
            alt="Dataskop Logo"
            onClick={handleLogoClicked}
          />
        </div>
        {version.includes('beta') && (
          <div className="ml-3 text-sm bg-yellow-300 px-1.5 py-0.5 text-grey-1200">
            Beta
          </div>
        )}
        {demoMode && (
          <div className="ml-3 text-sm bg-yellow-300 px-1.5 py-0.5 text-yellow-1200">
            Demo-Modus
          </div>
        )}
        <div className="flex items-center ml-auto mr-6">
          <div className="mr-4">
            <ScrapingProgressBar />
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
