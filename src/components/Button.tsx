import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { MouseEvent, ReactNode } from 'react';

export interface ButtonProps {
  size?: 'small' | 'medium' | 'large';
  theme?: 'outline' | 'link' | 'blue';
  startIcon?: IconDefinition;
  endIcon?: IconDefinition;
  classNames?: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  children?: ReactNode;
}

export default function Button({
  size = 'medium',
  theme = 'outline',
  startIcon,
  endIcon,
  classNames = '',
  disabled = false,
  onClick,
  children,
}: ButtonProps): JSX.Element {
  // set button content
  const buttonContent = [];

  if (startIcon) {
    buttonContent.push(
      <span key="start-icon" className={size === 'large' ? 'mr-2.5' : 'mr-2'}>
        <FontAwesomeIcon icon={startIcon} />
      </span>,
    );
  }

  buttonContent.push(
    <span key="content" className="select-none">
      {children}
    </span>,
  );

  if (endIcon) {
    buttonContent.push(
      <span key="end-icon" className={size === 'large' ? 'ml-2.5' : 'ml-2'}>
        <FontAwesomeIcon icon={endIcon} />
      </span>,
    );
  }

  // set button classes

  const buttonSize = {
    small: 'px-3 py-2.5 text-sm',
    medium: 'px-5 py-4 text-base',
    large: 'px-6 py-5 text-xl',
  };

  const buttonTheme = {
    outline: cn({
      'border-2 focus:outline-none text-yellow-1500': true,
      'border-yellow-700 hover:text-yellow-1200 focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50':
        !disabled,
      'border-yellow-1200 text-yellow-1200 opacity-20': disabled,
    }),
    link: cn({
      'text-yellow-1500 focus:outline-none': true,
      'hover:underline': !disabled,
      'text-gray-400': disabled,
    }),
    blue: cn({
      'border-2 focus:outline-none text-white': true,
      'border-blue-500 bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50':
        !disabled,
    }),
  };

  return (
    <button
      type="button"
      className={`inline-flex flex-nowrap items-center leading-none font-semibold transition duration-150 ease-in-out ${buttonSize[size]} ${buttonTheme[theme]} ${classNames}`}
      disabled={disabled === true}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
}
