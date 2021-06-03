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
import { getRouteConfigByPath } from '../router';
import logo from '../static/logos/dslogo.svg';

export default function Base({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
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
  // read config for current route
  const routeConfig = getRouteConfigByPath(useLocation().pathname);
  console.warn(routeConfig);

  useEffect(() => {
    const isDarkMode =
      routeConfig && typeof routeConfig.isDarkMode !== 'undefined'
        ? routeConfig.isDarkMode
        : false;
    const stepIndex =
      routeConfig && typeof routeConfig.stepIndex !== 'undefined'
        ? routeConfig.stepIndex
        : -1;

    if (isDarkMode === true) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (stepIndex >= 0) {
      setCurrentStepIndex(stepIndex);
    }
  }, [routeConfig]);

  return (
    <div className="relative flex flex-col h-screen justify-between">
      <header className="flex items-center py-4 px-6">
        <div>
          <img src={logo} style={{ width: '8rem' }} alt="Dataskop Logo" />
        </div>
        <div className="ml-auto mr-6">
          <Button key="my-data" size="small" theme="blue" onClick={() => false}>
            Meine Daten
          </Button>
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
