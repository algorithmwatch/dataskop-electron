import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../components/Button';
import Base from './Base';

function SlideBase({ children, footerNav = [] }): JSX.Element {
  const history = useHistory();

  return (
    <Base>
      <section className="flex-grow flex flex-col justify-center">
        {children}
      </section>

      <nav className="h-40 flex justify-between items-center max-w-4xl w-full mx-auto">
        {footerNav.map(
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
    </Base>
  );
}

export default SlideBase;
