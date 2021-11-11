/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState } from 'react';
import ytRoutes from 'renderer/providers/youtube/routes';
import routes from 'renderer/routes';
import { useConfig } from '../contexts/config';
import AdvancedMenu from './AdvancedMenu';

export default function Sidebar({
  menuItems = [],
  isOpen = false,
  onIsOpenChange,
}: {
  menuItems: {
    label: string;
    icon: IconDefinition;
    onClick: () => void;
  }[];
  isOpen?: boolean;
  onIsOpenChange: (value: boolean) => void;
}): JSX.Element | null {
  const {
    state: { version, showAdvancedMenu },
    dispatch,
  } = useConfig();

  // click the version to unlock the advanced menu
  const [versionClicked, setVersionClicked] = useState(0);
  const handleversionClicked = () => {
    if (versionClicked > 2) {
      dispatch({ type: 'show-advanced-menu' });
    } else setVersionClicked(versionClicked + 1);
  };

  const sidebarClasses = classNames({
    'w-80 fixed inset-y-0 bg-yellow-300 z-50': true,
    'transition-all duration-200 ease-in-out': true,
    'flex flex-col justify-between': true,
    '-right-80': !isOpen,
    'right-0': isOpen,
  });

  return (
    <div>
      <div className={sidebarClasses}>
        {/* main menu */}
        <div className="px-8 mt-16 flex flex-col space-y-6 items-start">
          {menuItems.map(({ label, icon, onClick }) => (
            <button
              key={label}
              type="button"
              className="flex text-yellow-1500 text-lg focus:outline-none hover:text-yellow-1200"
              onClick={onClick}
            >
              {icon && (
                <span className="w-6 mr-3">
                  <FontAwesomeIcon icon={icon} size="lg" />
                </span>
              )}
              <span className="font-bold">{label}</span>
            </button>
          ))}

          <div className="border border-yellow-900 border-opacity-50 text-sm text-yellow-1300 p-3">
            <strong>Hast Du technische Probleme?</strong> Schreibe eine Mail an{' '}
            <a
              href="mailto:support@dataskop.net"
              className="underline hover:no-underline"
            >
              support@dataskop.net
            </a>
            .
          </div>
        </div>

        {/* footer menu */}
        <div className="pl-8 mb-4 relative">
          {showAdvancedMenu && (
            <div className="absolute right-8 bottom-0">
              <AdvancedMenu
                onItemClicked={() => onIsOpenChange(false)}
                menuItems={[
                  { label: 'start', to: routes.START.path },
                  {
                    label: 'advanced scraping',
                    to: routes.ADMIN_SCRAPING_ADVANCED.path,
                  },
                  {
                    label: 'scraping config editor',
                    to: routes.ADMIN_SCRAPING_CONFIG_EDITOR.path,
                  },
                  { label: 'results', to: routes.ADMIN_RESULTS.path },
                  { label: 'settings', to: routes.ADMIN_SETTINGS.path },
                  { label: 'yt donation', to: ytRoutes.DONATION1.path },
                ]}
              />
            </div>
          )}

          <div
            className="text-sm text-yellow-1100"
            onClick={handleversionClicked}
          >
            DataSkop
            <br />
            Version: {version}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          tabIndex={-1}
          className="absolute inset-0 bg-yellow-1400 bg-opacity-50 z-40"
          onClick={() => onIsOpenChange(false)}
        />
      )}
    </div>
  );
}
