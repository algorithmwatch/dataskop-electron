import { faSpinnerThird } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button } from "./Button";

const UpdateNotification = (): JSX.Element | null => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);
  const [clickedRestart, setClickedRestart] = useState(false);

  useEffect(() => {
    window.electron.ipc.once("update-available", () => {
      setIsUpdateAvailable(true);
    });

    window.electron.ipc.once("update-downloaded", () => {
      setShowRestartButton(true);
    });
  }, []);

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed inset-0 z-60 bg-white flex flex-col items-center justify-center">
      <div className="space-y-4 text-center text-yellow-1500">
        <div className="hl-3xl">Neues Update verfügbar</div>

        {!showRestartButton && !clickedRestart ? (
          <div className="flex items-center justify-center">
            <div className="mr-2">
              <FontAwesomeIcon icon={faSpinnerThird} spin />
            </div>
            <div>Update wird heruntergeladen...</div>
          </div>
        ) : (
          <>
            {!clickedRestart && (
              <>
                <div>
                  Update heruntergeladen. Starte DataSkop neu, um es zu
                  installieren.
                </div>
                <Button
                  onClick={() => {
                    setShowRestartButton(false);
                    setClickedRestart(true);
                    window.electron.ipc.invoke("update-restart-app");
                  }}
                >
                  Neu starten
                </Button>
              </>
            )}
            {clickedRestart && (
              <div>Warte bitte einen Moment bis das Programm neu startet.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateNotification;
