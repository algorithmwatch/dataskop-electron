import { Button, Checkbox, FormControlLabel } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import React from 'react';
import { useScraping } from '../../contexts';

export default function SettingsPage(): JSX.Element {
  const {
    state: { logHtml },
    dispatch,
  } = useScraping();

  const handleLogHtmlChange = (event) => {
    dispatch({ type: 'set-log-html', logHtml: event.target.checked });
  };

  return (
    <div className="m-10">
      <h1>Settings</h1>
      <div className="pt-10 pb-10">
        <Button
          variant="contained"
          color="primary"
          onClick={() => ipcRenderer.invoke('check-beta-update')}
        >
          Check beta update
        </Button>
      </div>
      <div>
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
      </div>
    </div>
  );
}
