/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout from "renderer/components/WizardLayout";
import { useNavigation } from "../../../contexts";

export default function UploadDataExportPage(): JSX.Element {
  const { getNextPage } = useNavigation();
  const history = useHistory();

  const footerButtons = [
    <Button
      key="1"
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
  ];

  return (
    <WizardLayout className="text-center" footerButtons={footerButtons}>
      <h1 className="hl-4xl mb-20">Upload Data Eport</h1>
      <div className="space-y-4">
        <p>This is the content</p>
      </div>
    </WizardLayout>
  );
}
