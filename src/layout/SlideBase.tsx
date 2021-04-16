import { Button } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
import Base from './Base';

function SlideBase({ children, footerNav }): JSX.Element {
  const history = useHistory();

  return (
    <Base>
      {children}
      <div>
        {footerNav.map(({ label, to, disabled }) => (
          <Button key={label} onClick={() => history.push(to)}>
            {label}
          </Button>
        ))}
      </div>
    </Base>
  );
}

export default SlideBase;
