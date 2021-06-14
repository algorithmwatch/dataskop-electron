import React from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button, { ButtonProps } from './Button';

export interface FooterNavItem extends ButtonProps {
  label: string;
  clickHandler: (history: RouteComponentProps['history']) => void;
}

function FooterNav({ items = [] }: { items: FooterNavItem[] }): JSX.Element {
  const history = useHistory();

  return (
    <nav className="h-32 flex-shrink-0 flex justify-between items-center max-w-4xl w-full mx-auto">
      {items.map(
        ({
          label,
          size,
          theme,
          startIcon,
          endIcon,
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
