import { faSpinnerThird } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Button from "../providers/youtube/components/Button";

export default function UpdateNotification(): JSX.Element {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);

  useEffect(() => {
    window.electron.ipc.on("update-available", () => {
      window.electron.ipc.removeAllListeners("update-available");
      setIsUpdateAvailable(true);
    });
    window.electron.ipc.on("update-downloaded", () => {
      window.electron.ipc.removeAllListeners("update-downloaded");
      setShowRestartButton(true);
    });

    window.electron.ipc.on("update-error", (_event: any, error: Error) => {
      console.error(`error ${JSON.stringify(error)}`);
    });
  }, []);

  return (
    <>
      {isUpdateAvailable && (
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center">
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
                    window.electron.ipc.invoke("update-restart-app")
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
