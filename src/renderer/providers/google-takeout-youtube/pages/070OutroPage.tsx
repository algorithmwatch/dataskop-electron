/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 * Text-heavy outro page
 *
 * @module
 */

import { useState } from "react";
import ContentPage from "../../../pages/ContentPage";

const ExportLink = ({ setExporting }) => {
  return (
    <span>
      Wenn du deine Daten herunterladen möchtest, klicke{" "}
      <span
        className="hover:cursor-pointer underline"
        onClick={async () => {
          setExporting(true);
          await window.electron.ipc.invoke("google-takout-youtube-data-export");
          setExporting(false);
        }}
      >
        hier
      </span>
      . Sie werden beim Schließen der App gelöscht.
    </span>
  );
};

const OutroPage = (): JSX.Element => {
  const [isExporting, setExporting] = useState();

  return (
    <ContentPage title="Vielen Dank">
      <div className="space-y-6 text-xl max-w-prose">
        {/* <div>
          Vielen Dank, dass du DataSkop genutzt hast. Wenn du magst kannst, du
          hier alle Daten exportieren.
        </div> */}
        <div>
          {isExporting ? (
            "Einen Momement, bitte..."
          ) : (
            <ExportLink setExporting={setExporting} />
          )}
        </div>
        {/* <div>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Porro
          sapiente, voluptates laudantium ad fugiat ipsa aperiam blanditiis in,
          itaque unde at corporis, sint eos dolor rerum repellat! Ipsa,
          voluptate quibusdam.
        </div> */}
        <div className="text-sm text-neutral-500" key="1">
          Du kannst die{" "}
          <span
            className="underline hover:cursor-pointer"
            onClick={() => window.electron.ipc.invoke("quit")}
          >
            App jetzt schließen
          </span>
          .
        </div>
      </div>
    </ContentPage>
  );
};

export default OutroPage;
