import {
  faBars,
  faChartPieAlt,
  faInfoCircle,
  faPaperPlane
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/Button';
import ProcessIndicator from '../components/ProcessIndicator';
import ScrapingProgressBar from '../components/ScrapingProgressBar';
import Sidebar from '../components/Sidebar';
import { useConfig, useNavigation } from '../contexts';
import { useScraping } from '../contexts/scraping';
import logo from '../static/logos/dslogo.svg';
import { postEvent } from '../utils/networking';

const sidebarMenu = [
  {
    label: 'Menüpunkt 1',
    icon: faChartPieAlt,
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

export default function Base({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(0);
  const { pathname } = useLocation();
  const {
    state: { campaign },
  } = useScraping();
  const {
    state: { trackRouteChanges, platformUrl },
  } = useConfig();
  const {
    state: { pageIndex, sections },
    dispatch,
    getCurrentPage,
    getPageIndexByPath,
  } = useNavigation();

  // read config for current route
  useEffect(() => {
    const nextPageIndex = getPageIndexByPath(pathname);

    // set page index
    if (nextPageIndex !== -1) {
      dispatch({ type: 'set-page-index', pageIndex: nextPageIndex });
    }

    if (trackRouteChanges && campaign !== null && platformUrl !== null) {
      postEvent(platformUrl, campaign.id, pathname, {});
    }
  }, [pathname]);

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
    if (page.sectionIndex >= 0) {
      setSectionIndex(page.sectionIndex);
    }
  }, [pageIndex]);

  return (
    <div className="relative flex flex-col h-screen justify-between">
      <header className="flex items-center py-4 px-6">
        <div>
          <img src={logo} style={{ width: '8rem' }} alt="Dataskop Logo" />
        </div>
        <div className="flex items-center ml-auto mr-6">
          <ScrapingProgressBar />

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
      <main className="flex flex-grow flex-col justify-between overflow-y-auto overflow-x-hidden pt-4">
        {children}
      </main>

      <footer>
        <ProcessIndicator steps={sections} currentStep={sectionIndex} />
      </footer>
    </div>
  );
}
