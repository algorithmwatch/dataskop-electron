import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

export default function UpdateNotification(): JSX.Element {
  const [text, setText] = useState('');
  const [showRestart, setShowRestart] = useState(false);

  useEffect(() => {
    ipcRenderer.on('update_available', () => {
      ipcRenderer.removeAllListeners('update_available');
      setText('A new update is available. Downloading now...');
    });
    ipcRenderer.on('update_downloaded', () => {
      ipcRenderer.removeAllListeners('update_downloaded');
      setText(
        'Update Downloaded. It will be installed on restart. Restart now?',
      );
      setShowRestart(true);
    });

    ipcRenderer.on('update_error', (event, error) => {
      setText(`error ${JSON.stringify(error)}`);
    });
  }, []);

  return (
    <>
      <div className="notification">{text}</div>
      {showRestart && (
        <button type="button" onClick={() => ipcRenderer.send('restart_app')}>
          Restart
        </button>
      )}
    </>
  );
}
