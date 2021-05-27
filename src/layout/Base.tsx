import { faBars } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode, useEffect } from 'react';
import AdvancedMenu from '../components/AdvancedMenu';
import Button from '../components/Button';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';
import logo from '../static/logos/dslogo.svg';

export default function Base({
  children,
  isDarkMode = false,
}: {
  children: ReactNode;
  isDarkMode?: boolean;
}): JSX.Element {
  const {
    state: { version, showAdvancedMenu },
  } = useConfig();

  useEffect(() => {
    if (isDarkMode === true) {
      document.documentElement.classList.add('dark');
      console.warn('darkmode enabled');
    } else if (isDarkMode === false) {
      document.documentElement.classList.remove('dark');
      console.warn('darkmode disabled');
    }
  }, [isDarkMode]);

  return (
    <div className="flex flex-col h-screen justify-between px-6">
      <header className="flex py-4 items-center">
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
          >
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>
      </header>

      {/*  h-full hides the debug button for long pages */}
      <main className="pt-4 flex flex-grow flex-col">{children}</main>

      <footer className="pt-6 pb-4 flex justify-between items-center">
        {/* debug menu */}
        <div>
          {showAdvancedMenu && (
            <AdvancedMenu
              menuItems={[
                { label: 'start', to: routes.START },
                { label: 'advanced scraping', to: routes.SCRAPING_ADVANCED },
                { label: 'results', to: routes.RESULTS },
                { label: 'provider login', to: routes.PROVIDER_LOGIN },
                {
                  label: 'experiment scraping',
                  to: routes.SCRAPING_EXPERIMENT,
                },
                { label: 'settings', to: routes.SETTINGS },
              ]}
            />
          )}
        </div>

        <div className="text-sm text-gray-400">
          <div>version: {version}</div>
        </div>
      </footer>
    </div>
  );
}
