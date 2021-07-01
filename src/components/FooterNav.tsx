import React from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button, { ButtonProps } from './Button';

export interface FooterNavItem extends ButtonProps {
  label: string;
  clickHandler: (history: RouteComponentProps['history']) => void;
}

function FooterNav({ items = [] }: { items: FooterNavItem[] }) {
  const history = useHistory();

  return (
    <nav className="h-32 flex-shrink-0 flex justify-between items-center w-full px-6">
      {items.map(
        ({
          label,
          size,
          theme,
          startIcon,
          endIcon,
          tippyOptions,
          clickHandler,
          disabled,
          classNames,
        }) => (
          <Button
            key={label}
            disabled={disabled}
            startIcon={startIcon}
            endIcon={endIcon}
            size={size}
            theme={theme}
            classNames={classNames}
            tippyOptions={tippyOptions}
            onClick={() => clickHandler(history)}
          >
            {label}
          </Button>
        ),
      )}
    </nav>
  );
}

export default FooterNav;
