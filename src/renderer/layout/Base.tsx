import {
  faBars,
  faFileContract,
  faInfoCircle,
  faPaperPlane,
  faUserSecret,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from '../components/Modal';
import ProcessIndicator from '../components/ProcessIndicator';
import ScrapingProgressBar from '../components/ScrapingProgressBar';
import Sidebar from '../components/Sidebar';
import { useConfig, useModal, useNavigation, useScraping } from '../contexts';
import routes from '../routes';
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
  const {
    state: { version },
  } = useConfig();
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
          'opacity-0': pathname === routes.START.path,
        })}
      >
        <div>
          <img src={logo} style={{ width: '8rem' }} alt="Dataskop Logo" />
        </div>
        {version && version.includes('beta') && (
          <div className="ml-3 text-sm bg-yellow-300 px-1.5 py-0.5 text-yellow-1300">
            Beta
          </div>
        )}
        {demoMode && (
          <div className="ml-3 text-sm bg-yellow-300 px-1.5 py-0.5 text-yellow-1300">
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

      <div className="absolute inset-x-0 bottom-0 py-12 bg-gradient-to-b	from-transparent to-yellow-100" />

      <main className="flex flex-grow flex-col justify-between overflow-auto pt-4 pb-2">
        {children}
      </main>

      <footer className="fixed bottom-0 inset-x-0 z-10">
        <ProcessIndicator steps={sections} currentStep={sectionKey} />
      </footer>
    </div>
  );
}
