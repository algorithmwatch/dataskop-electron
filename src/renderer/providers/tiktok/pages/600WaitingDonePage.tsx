/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFaceSadSweat, faPartyHorn } from "@fortawesome/pro-light-svg-icons";
import { faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import { useNavigation } from "../../../contexts";

export default function WaitingDonePage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const hasData = true;

  const footerSlots: FooterSlots = {
    center: [
      hasData ? (
        <Button
          key="1"
          endIcon={faAngleRight}
          onClick={() => {
            history.push(getNextPage("path"));
          }}
        >
          Weiter
        </Button>
      ) : (
        <div>
          <div className="font-bold mb-2 text-lg -mt-8">
            Möchtest du deine Daten spenden?
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button
              className="min-w-[6rem]"
              onClick={() => {
                history.push("/tiktok/donation_form");
              }}
            >
              Ja
            </Button>
            <Button
              className="min-w-[6rem]"
              theme="text"
              onClick={() => {
                history.push("/tiktok/newsletter_choice");
              }}
            >
              Nein
            </Button>
          </div>
        </div>
      ),
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content
        title={hasData ? "Die Daten sind da!" : "Oh nein!"}
        icon={hasData ? faPartyHorn : faFaceSadSweat}
        theme="transparent"
      >
        {hasData ? (
          <p>
            Du hast es geschafft! Die DataSkop-App hat deine TikTok-Daten
            untersucht und für dich drei Visualisierungen erstellt. Schau sie
            dir an!
          </p>
        ) : (
          <>
            <p className="mb-4">
              Leider haben wir nicht genug Daten über dich, um dir
              Visualisierungen zu zeigen.
            </p>
            <p>
              Du kannst uns trotzdem helfen und deine Daten spenden. Sie werden
              ausschließlich für Forschungszwecke verwendet und bleiben anonym.
            </p>
          </>
        )}
      </Content>
    </WizardLayout>
  );
}
