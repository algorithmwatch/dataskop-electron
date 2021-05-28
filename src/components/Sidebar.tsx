import classNames from 'classnames';
import React from 'react';
// import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Sidebar({
  isOpen = false,
  onIsOpenChange,
}: {
  isOpen?: boolean;
  onIsOpenChange: (value: boolean) => void;
}): JSX.Element | null {
  const classes = classNames({
    'w-80 absolute inset-y-0 -right-80 bg-yellow-300 z-50 transition duration-200 ease-in-out transform': true,
    '-translate-x-80': isOpen,
  });

  return (
    <>
      <div className={classes}>
        <div>Menüpunkt 1</div>
        <div>Menüpunkt 2</div>
        <div>Menüpunkt 3</div>
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        tabIndex={-1}
        className={`absolute inset-0 bg-yellow-1200 bg-opacity-50 z-40 ${
          !isOpen && 'hidden'
        }`}
        onClick={() => onIsOpenChange(false)}
      />
    </>
  );

  return null;
}
