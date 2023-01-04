/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileImport } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import DropFile from "renderer/components/DropFile";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { addScrapingResult } from "renderer/lib/db";
import Content from "renderer/providers/tiktok/components/Content";

const ImportDataExportPage = (): JSX.Element => {
  const history = useHistory();
  const [importIsValid, setImportIsValid] = useState(false);
  const [inputTouched, setInputTouched] = useState(false);

  const handleFiles = async (files: File[]) => {
    const response = await window.electron.ipc.invoke(
      "downloads-import",
      files.map(({ path }) => path),
    );

    if (response.success) {
      await addScrapingResult(
        "no-session",
        0,
        {
          success: true,
          fields: {
            status: "files-imported",
            paths: response.paths,
          },
        },
        true,
      );
    }

    setImportIsValid(response.success);
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
          // First navigate, then start scraping on the waiting page
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
        <div className="flex min-h-[8rem] lg:min-h-[10rem] xl:min-h-[12rem] 2xl:min-h-[16rem]">
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
              <div className="text-emerald-500">
                Das hat geklappt. Klicke auf „Weiter“, um fortzufahren.
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
};

export default ImportDataExportPage;