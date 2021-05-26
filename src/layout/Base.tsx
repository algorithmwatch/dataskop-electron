import React, { useEffect } from 'react';
import AdvancedMenu from '../components/AdvancedMenu';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';

export default function Base({ children, isDarkMode = false }): JSX.Element {
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
      {/* <header className="flex"></header> */}

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
