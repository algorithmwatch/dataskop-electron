import { Button, Checkbox, FormControlLabel } from '@material-ui/core';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { humanFileSize } from 'renderer/lib/utils/strings';
import { useConfig, useScraping } from '../../contexts';

export default function SettingsPage(): JSX.Element {
  const {
    state: { logHtml },
    dispatch,
  } = useScraping();

  const {
    state: { platformUrl },
  } = useConfig();

  const handleLogHtmlChange = (event: any) => {
    dispatch({ type: 'set-log-html', logHtml: event.target.checked });
  };

  const [exportOngoing, setExportOngoing] = useState(false);
  const [storage, setStorage] = useState<string>('calculating...');

  useEffect(() => {
    (async () =>
      setStorage(
        humanFileSize(
          _.sum(await window.electron.ipcRenderer.invoke('export-debug-size')),
        ),
      ))();
  }, []);

  return (
    <div className="m-10">
      <h1>Settings</h1>
      <div>Platform url: {platformUrl}</div>
      <div className="pt-10 pb-10">
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            window.electron.ipcRenderer.invoke('check-beta-update')
          }
        >
          Check beta update
        </Button>
      </div>
      <div className="">
        <FormControlLabel
          control={
            <Checkbox
              checked={logHtml}
              onChange={handleLogHtmlChange}
              name="checkedB"
              color="primary"
            />
          }
          label="Enable logging"
        />
      </div>
      <div className="pt-10 pb-10">
        <Button
          disabled={exportOngoing}
          variant="contained"
          color="primary"
          onClick={async () => {
            setExportOngoing(true);
            await window.electron.ipcRenderer.invoke('export-debug-archive');
            setExportOngoing(false);
          }}
        >
          Export debug archive
        </Button>
        {exportOngoing && 'Exporting...'}
      </div>

      <div className="pb-20">Storage of debug files: {storage}</div>

      <div className="pl-10 pt-5 pb-5 bg-red-700 text-white bold">
        DANGER!!!
        <div className="pt-10 pb-10">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.electron.ipcRenderer.invoke('export-debug-clean');
            }}
          >
            Remove debug files (logs, html)
          </Button>
        </div>
      </div>
    </div>
  );
}
