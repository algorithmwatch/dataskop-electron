import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { useState } from 'react';

export default function Explainer({
  isOpen = false,
  onIsOpenChange,
  children,
}: {
  isOpen?: boolean;
  onIsOpenChange: (value: boolean) => void;
  children: React.ReactNode;
}): JSX.Element | null {
  const [isToggleHover, setIsToggleHover] = useState(false);
  const containerClasses = classNames({
    'w-2/3 fixed inset-y-0 bg-white z-30': true,
    'transition-all duration-200 ease-in-out': true,
    'flex flex-col justify-between': true,
    'box-content border-r-8': true,
    '-left-2/3': !isOpen,
    'left-0': isOpen,
    'border-yellow-600': !isToggleHover,
    'border-yellow-800': isToggleHover,
  });
  const toggleClasses = classNames({
    'w-10 h-10 absolute top-24 focus:outline-none ': true,
    'transition-all duration-200 ease-in-out': true,
    '-right-6': isOpen,
    '-right-12': !isOpen,
    'bg-yellow-600': !isToggleHover,
    'bg-yellow-800': isToggleHover,
  });

  return (
    <div>
      <div className={containerClasses}>
        {/* Open/close toggle */}
        {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
        <button
          type="button"
          className={toggleClasses}
          onClick={() => onIsOpenChange(!isOpen)}
          onMouseOver={() => setIsToggleHover(true)}
          onMouseOut={() => setIsToggleHover(false)}
        >
          <FontAwesomeIcon
            icon={isOpen ? faChevronLeft : faChevronRight}
            className="text-yellow-1500"
            size="lg"
          />
        </button>

        {/* Content */}
        <div className="pl-8 mt-16 flex flex-col space-y-6 items-start">
          {children}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          tabIndex={-1}
          className="absolute inset-0 bg-yellow-1400 bg-opacity-50 z-20"
          onClick={() => onIsOpenChange(false)}
        />
      )}
    </div>
  );
}
