import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const buttonSize = {
  small: 'px-4 py-2 text-xs',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-4 text-lg',
};

const buttonTheme = {
  outline: 'border border-gray-900',
};

export default function Button({
  size = 'medium',
  theme = 'outline',
  startIcon,
  endIcon,
  children,
  disabled = false,
  clickHandler,
}) {
  // set button content
  const buttonContent = [];

  if (startIcon) {
    buttonContent.push(
      <span key="start-icon" className="mr-2">
        <FontAwesomeIcon icon={startIcon} />
      </span>,
    );
  }

  buttonContent.push(<span key="content">{children}</span>);

  if (endIcon) {
    buttonContent.push(
      <span key="end-icon" className="ml-2">
        <FontAwesomeIcon icon={endIcon} />
      </span>,
    );
  }

  // set class names
  const classNames = `inline-flex flex-nowrap ${buttonSize[size]} ${buttonTheme[theme]}`;

  return (
    <button type="button" className={classNames} onClick={clickHandler}>
      {buttonContent}
    </button>
  );
}
