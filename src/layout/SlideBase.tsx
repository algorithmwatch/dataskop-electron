import { Button } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
import Base from './Base';

function SlideBase({ children, footerNav }): JSX.Element {
  const history = useHistory();

  return (
    <Base>
      <section className="flex-grow flex flex-col justify-center">
        {children}
      </section>

      <nav className="h-40 flex justify-between">
        {footerNav.map(({ label, onClick, disabled }) => (
          <Button key={label} onClick={() => onClick(history)}>
            {label}
          </Button>
        ))}
      </nav>
    </Base>
  );
}

export default SlideBase;
