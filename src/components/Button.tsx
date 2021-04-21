import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React from 'react';

export default function Button({
  size = 'medium',
  theme = 'outline',
  startIcon,
  endIcon,
  classNames,
  disabled = false,
  clickHandler,
  children,
}) {
  // set button content
  const buttonContent = [];

  if (startIcon) {
    buttonContent.push(
      <span key="start-icon" className={size === 'large' ? 'mr-2.5' : 'mr-2'}>
        <FontAwesomeIcon icon={startIcon} />
      </span>,
    );
  }

  buttonContent.push(<span key="content">{children}</span>);

  if (endIcon) {
    buttonContent.push(
      <span key="end-icon" className={size === 'large' ? 'ml-2.5' : 'ml-2'}>
        <FontAwesomeIcon icon={endIcon} />
      </span>,
    );
  }

  // set button classes

  const buttonSize = {
    small: 'px-4 py-2 text-xs',
    medium: 'px-5 py-4 text-base',
    large: 'px-6 py-5 text-xl',
  };

  const buttonTheme = {
    outline: cn({
      'border focus:outline-none': true,
      'border-gray-400 hover:border-gray-900 focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50': !disabled,
      'border-gray-200 text-gray-400': disabled,
    }),
  };

  return (
    <button
      type="button"
      className={`inline-flex flex-nowrap items-center leading-none rounded-full font-semibold transition duration-150 ease-in-out ${buttonSize[size]} ${buttonTheme[theme]} ${classNames}`}
      disabled={disabled === true}
      onClick={clickHandler}
    >
      {buttonContent}
    </button>
  );
}
