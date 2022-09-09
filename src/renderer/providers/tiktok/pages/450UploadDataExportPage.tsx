/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileImport } from "@fortawesome/pro-light-svg-icons";
import { faCircleCheck } from "@fortawesome/pro-regular-svg-icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import DropFile from "renderer/components/DropFile";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useScraping } from "renderer/contexts";
import { currentDelay } from "renderer/lib/delay";
import Content from "renderer/providers/tiktok/components/Content";

export default function UploadDataExportPage(): JSX.Element {
  const { dispatch } = useScraping();
  const history = useHistory();
  const [importIsValid, setImportIsValid] = useState(false);
  const [inputTouched, setInputTouched] = useState(false);
  const handleFiles = async (files: File[]) => {
    const response = await window.electron.ipc.invoke(
      "import-files",
      files.map(({ path }) => path),
    );

    setImportIsValid(response === true);
    if (!inputTouched) setInputTouched(true);
  };

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          history.push("/tiktok/before_login");
        }}
      >
        Zurück
      </Button>,
      <Button
        key="2"
        endIcon={faAngleRight}
        disabled={!importIsValid}
        onClick={async () => {
          dispatch({ type: "set-attached", attached: true, visible: false });
          await currentDelay();
          dispatch({
            type: "start-scraping",
            filterSteps: (x) => x.slug.includes("scraping"),
          });

          history.push("/tiktok/waiting");
        }}
      >
        Weiter
      </Button>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content
        title="Wähle deine DSGVO-Daten aus"
        icon={faFileImport}
        theme="transparent"
      >
        <p className="mb-8">
          Wenn du die DSGVO-Daten auf TikTok bereits beantragt und den
          Datenexport heruntergeladen hast, kannst du ihn hier einfügen. Die
          DSGVO-Daten werden dann nicht erneut beantragt.
        </p>
        <div className="flex min-h-[16rem]">
          <DropFile handleFiles={handleFiles} isDoppable={importIsValid}>
            {!inputTouched && !importIsValid && (
              <>
                <p className="max-w-lg">
                  Hier klicken, um die Datei auszuwählen, oder die Datei mit dem
                  Cursor in dieses Feld ziehen.
                </p>
                <p className="text-base text-gray-500 mt-1">
                  Die Datei muss das JSON-Format haben.
                </p>
              </>
            )}

            {inputTouched && importIsValid && (
              <div className="flex items-center justify-center space-x-3">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-emerald-500 text-3xl"
                />
                <div>
                  Das hat geklappt. Klicke auf „Weiter“, um fortzufahren.
                </div>
              </div>
            )}

            {inputTouched && !importIsValid && (
              <div className="flex items-center justify-center text-red-500">
                Wir können die Datei leider nicht verarbeiten. Ist sie im
                JSON-Format?
              </div>
            )}
          </DropFile>
        </div>
      </Content>
    </WizardLayout>
  );
}
