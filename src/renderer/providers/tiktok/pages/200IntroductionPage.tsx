/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import { useNavigation } from "../../../contexts";

export default function IntroductionPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();

  const footerSlots: FooterSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          history.push(getPreviousPage("path"));
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
      <Content title="Willkommen bei DataSkop 👋" theme="transparent">
        <div className="space-y-6 text-xl max-w-prose">
          <p>
            TikTok sammelt viele Daten über dich. Weißt du auch welche? <br />
            Sogenannte „personenbezogene Daten“ lassen Rückschlüsse auf die
            Persönlichkeit oder Lebensführung zu. Doch den Nutzer*innen großer
            Plattformen wie TikTok ist oft unklar, welche Daten das sind.
          </p>

          <p>
            Mit der DataSkop-App wollen wir gemeinsam mit dir untersuchen,
            welche Daten TikTok über dich erhebt.
          </p>

          <p>
            Am Ende hast du die Möglichkeit, diese Daten an uns zu spenden.
            Darüber würden wir uns sehr freuen, denn mit deiner Datenspende tust
            du etwas Gutes für die Wissenschaft.
          </p>
        </div>
      </Content>
    </WizardLayout>
  );
}
