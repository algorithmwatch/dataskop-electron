import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy, { TippyProps } from '@tippyjs/react';
import cn from 'classnames';
import React, { MouseEvent, ReactNode } from 'react';

export interface ButtonProps {
  size?: 'small' | 'medium' | 'large';
  theme?: 'outline' | 'link' | 'blue';
  startIcon?: IconDefinition;
  endIcon?: IconDefinition;
  classNames?: string;
  disabled?: boolean;
  tippyOptions?: TippyProps;
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
  tippyOptions,
  onClick,
  children,
}: ButtonProps) {
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

  const button = (
    <button
      type="button"
      className={`inline-flex flex-nowrap items-center leading-none font-semibold transition duration-150 ease-in-out ${buttonSize[size]} ${buttonTheme[theme]} ${classNames}`}
      disabled={disabled}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );

  if (tippyOptions) {
    // disabled elements need to be wrapped in order for Tippy to work
    // accesibility issues. see: https://atomiks.github.io/tippyjs/v6/constructor/#disabled-elements
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Tippy {...tippyOptions}>
        {disabled ? <span tabIndex="0">{button}</span> : button}
      </Tippy>
    );
  }

  return button;
}
