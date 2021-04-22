import React from 'react';
import DebugMenu from '../components/DebugMenu';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';

export default function Base({ children }): JSX.Element {
  const {
    state: { version, showQuickJumpMenu },
  } = useConfig();

  return (
    <div className="flex flex-col h-screen justify-between px-6">
      {/* <header className="flex"></header> */}

      {/*  h-full hides the debug button for long pages */}
      <main className="pt-4 flex flex-grow flex-col">{children}</main>

      <footer className="pt-6 pb-4 flex justify-between items-center">
        {/* debug menu */}
        <div>
          {showQuickJumpMenu && (
            <DebugMenu
              menuItems={[
                { label: 'start', to: routes.START },
                { label: 'advanced scraping', to: routes.SCRAPING_ADVANCED },
                { label: 'results', to: routes.RESULTS },
                { label: 'provider login', to: routes.PROVIDER_LOGIN },
                {
                  label: 'experiment scraping',
                  to: routes.SCRAPING_EXPERIMENT,
                },
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
