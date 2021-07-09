import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import routes from '../constants/routes.json';
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
  } = useConfig();

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
        <div className="pl-8 mt-16 flex flex-col space-y-6 items-start">
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
        </div>

        {/* footer menu */}
        <div className="pl-8 mb-4 relative">
          {showAdvancedMenu && (
            <div className="absolute right-8 bottom-0">
              <AdvancedMenu
                onItemClicked={() => onIsOpenChange(false)}
                menuItems={[
                  { label: 'start', to: routes.START },
                  { label: 'advanced scraping', to: routes.SCRAPING_ADVANCED },
                  {
                    label: 'scraping config editor',
                    to: routes.SCRAPING_CONFIG_EDITOR,
                  },
                  { label: 'results', to: routes.RESULTS },
                  { label: 'settings', to: routes.SETTINGS },
                  { label: 'donation', to: routes.DONATION1 },
                ]}
              />
            </div>
          )}

          <div className="text-sm text-yellow-1100">
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
