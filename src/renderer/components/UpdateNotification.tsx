import { faSpinnerThird } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import Button from './Button';

export default function UpdateNotification(): JSX.Element {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.on('update_available', () => {
      window.electron.ipcRenderer.removeAllListeners('update_available');
      setIsUpdateAvailable(true);
    });
    window.electron.ipcRenderer.on('update_downloaded', () => {
      window.electron.ipcRenderer.removeAllListeners('update_downloaded');
      setShowRestartButton(true);
    });

    window.electron.ipcRenderer.on(
      'update_error',
      (_event: any, error: Error) => {
        console.error(`error ${JSON.stringify(error)}`);
      },
    );
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
                <Button
                  onClick={() =>
                    window.electron.ipcRenderer.invoke('restart_app')
                  }
                >
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
