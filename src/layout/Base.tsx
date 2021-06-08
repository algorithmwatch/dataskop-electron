import {
  faBars,
  faChartPieAlt,
  faInfoCircle,
  faPaperPlane,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/Button';
import ProcessIndicator from '../components/ProcessIndicator';
import Sidebar from '../components/Sidebar';
import routes from '../constants/routes.json';
import { useScraping } from '../contexts/scraping';
import logo from '../static/logos/dslogo.svg';

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
const processIndicatorSteps = [
  {
    label: 'Section 1',
  },
  {
    label: 'Section 2',
  },
  {
    label: 'Section 3',
  },
  {
    label: 'Section 4',
  },
  {
    label: 'Section 5',
  },
  {
    label: 'Section 6',
  },
];

const routeSetting: {
  [key: string]: {
    stepIndex: number;
    isDarkMode: boolean;
  };
} = {
  [routes.START]: {
    stepIndex: 0,
    isDarkMode: false,
  },
  [routes.EXPLANATION]: {
    stepIndex: 1,
    isDarkMode: false,
  },
  [routes.PROVIDER_LOGIN]: {
    stepIndex: 2,
    isDarkMode: false,
  },
};

export default function Base({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { pathname } = useLocation();
  const {
    state: { scrapingProgress },
  } = useScraping();

  // read config for current route
  useEffect(() => {
    const setting = routeSetting[pathname];

    if (setting) {
      if (typeof setting.isDarkMode !== 'undefined') {
        if (setting.isDarkMode === true) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      if (typeof setting.stepIndex !== 'undefined') {
        if (setting.stepIndex >= 0) {
          setCurrentStepIndex(setting.stepIndex);
        }
      }
    }
  }, [pathname]);

  return (
    <div className="relative flex flex-col h-screen justify-between">
      <header className="flex items-center py-4 px-6">
        <div>
          <img src={logo} style={{ width: '8rem' }} alt="Dataskop Logo" />
        </div>
        <div className="flex items-center ml-auto mr-6">
          {/* Scraping progress bar */}
          {scrapingProgress.isActive && (
            <div className="mr-4">
              <progress value={scrapingProgress.value} max="1" className="">
                {scrapingProgress.value}
              </progress>
            </div>
          )}

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
      <main className="flex flex-grow flex-col pt-4 px-6">{children}</main>

      <footer>
        <ProcessIndicator
          steps={processIndicatorSteps}
          currentStep={currentStepIndex}
        />
      </footer>
    </div>
  );
}
