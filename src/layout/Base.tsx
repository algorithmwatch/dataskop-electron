import React from 'react';
import SimpleMenu from '../components/SimpleMenu';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';

export default function Base({ children }): JSX.Element {
  const {
    state: { version, showQuickJumpMenu },
  } = useConfig();

  return (
    <>
      <div className="flex flex-row-reverse">
        <div className="flex-initial m-5">
          {showQuickJumpMenu && (
            <SimpleMenu
              menuItems={[
                { label: 'start', to: routes.HOME },
                { label: 'advanced scraping', to: routes.SCRAPING_ADVANCED },
                { label: 'results', to: routes.RESULTS },
              ]}
            />
          )}
        </div>
        <div className="flex-initial m-5 text-sm text-gray-400">
          <div>version: {version}</div>
        </div>
      </div>
      <div className="overflow-y-auto p-10">{children}</div>
    </>
  );
}
