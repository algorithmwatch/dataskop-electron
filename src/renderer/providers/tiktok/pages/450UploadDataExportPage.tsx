/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileImport } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import DropFile from "renderer/components/DropFile";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import { useNavigation } from "../../../contexts";

export default function UploadDataExportPage(): JSX.Element {
  const { getNextPage } = useNavigation();
  const history = useHistory();

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
        onClick={() => {
          history.push(getNextPage("path"));
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
        size="sm"
        theme="transparent"
      >
        <p className="mb-8">
          Wenn du die DSGVO-Daten auf TikTok bereits beantragt und den
          Daten-Export heruntergeladen hast, kannst du ihn hier einfügen. Die
          DSGVO-Daten werden dann nicht erneut beantragt.
        </p>
        <DropFile>
          <p className="text-base max-w-lg">
            Hier klicken, um eine Datei auszuwählen. Oder die Datei mit der Maus
            in dieses Feld ziehen.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Die Datei muss eine JSON-Datei sein.
          </p>
        </DropFile>
      </Content>
    </WizardLayout>
  );
}
