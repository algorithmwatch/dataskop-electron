import { faSpinnerThird } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import Button from './Button';

export default function UpdateNotification(): JSX.Element {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);

  useEffect(() => {
    // Not available in Test environment.
    if (ipcRenderer == null) return;

    ipcRenderer.on('update_available', () => {
      ipcRenderer.removeAllListeners('update_available');
      setIsUpdateAvailable(true);
    });
    ipcRenderer.on('update_downloaded', () => {
      ipcRenderer.removeAllListeners('update_downloaded');
      setShowRestartButton(true);
    });

    ipcRenderer.on('update_error', (event, error) => {
      console.error(`error ${JSON.stringify(error)}`);
    });
  }, []);

  return (
    <>
      {isUpdateAvailable && (
        <div className="fixed inset-0 bg-yellow-100 z-60 flex flex-col items-center justify-center">
          <div className="space-y-4 text-center text-yellow-1500">
            <div className="hl-3xl">Neues Update verfügbar</div>

            {!showRestartButton ? (
              <div className="flex items-center justify-center">
                <div className="mr-2">
                  <FontAwesomeIcon icon={faSpinnerThird} spin />
                </div>
                <div>Update wird heruntergeladen...</div>
              </div>
            ) : (
              <>
                <div>
                  Update heruntergeladen. Starte DataSkop neu, um es zu
                  installieren.
                </div>
                <Button onClick={() => ipcRenderer.send('restart_app')}>
                  Neustarten
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
