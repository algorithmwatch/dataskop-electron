import { Checkbox, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { useConfig } from '../contexts/config';
import Base from '../layout/Base';

export default function SettingsPage(): JSX.Element {
  const {
    state: { logHtml },
    dispatch,
  } = useConfig();

  const handleLogHtmlChange = (event) => {
    dispatch({ type: 'set-log-html', logHtml: event.target.checked });
  };

  return (
    <Base>
      <h1>Settings</h1>
      <FormControlLabel
        control={
          <Checkbox
            checked={logHtml}
            onChange={handleLogHtmlChange}
            name="checkedB"
            color="primary"
          />
        }
        label="Log HTML"
      />
    </Base>
  );
}
