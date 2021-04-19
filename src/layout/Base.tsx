import React from 'react';
import DebugMenu from '../components/DebugMenu';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';

export default function Base({ children }): JSX.Element {
  const {
    state: { version, showQuickJumpMenu },
  } = useConfig();

  return (
    <div className="flex flex-col h-screen justify-between">
      {/* <header className="flex"></header> */}

      <main className="px-4 h-full flex flex-col">{children}</main>

      <footer className="px-4 pt-6 pb-4 flex justify-between items-center">
        {/* debug menu */}
        <div>
          {showQuickJumpMenu && (
            <DebugMenu
              menuItems={[
                { label: 'start', to: routes.HOME },
                { label: 'advanced scraping', to: routes.SCRAPING_ADVANCED },
                { label: 'results', to: routes.RESULTS },
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
