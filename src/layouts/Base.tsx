import React from 'react';
import SimpleMenu from '../components/SimpleMenu';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';

export default function Base({ children }): JSX.Element {
  const {
    state: { version, showQuickJumpMenu },
  } = useConfig();

  return (
    <section className="section">
      <div className="columns">
        <div className="column">
          {showQuickJumpMenu && (
            <SimpleMenu
              menuItems={[
                { label: 'start', to: routes.HOME },
                { label: 'scraping', to: routes.SCRAPING },
                { label: 'results', to: routes.RESULTS },
              ]}
            />
          )}
        </div>
        <div className="column is-narrow">
          <div>{version}</div>
        </div>
      </div>
      <div className="" style={{ height: '100vh' }}>
        <div
          style={{ overflow: 'scroll', height: '100%' }}
          data-tid="container"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
