/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileHeart } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import { useNavigation } from "../../../contexts";

export default function DonationChoicePage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();

  const footerSlots: FooterSlots = {
    start: [
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
    ],
    center: [
      <Button
        key="1"
        className="min-w-[6rem]"
        onClick={() => {
          history.push("/tiktok/donation_upload");
        }}
      >
        Ja
      </Button>,
      <Button
        key="2"
        className="min-w-[6rem]"
        theme="outline"
        onClick={() => {
          history.push("/tiktok/newsletter");
        }}
      >
        Nein
      </Button>,
    ],
  };

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content
        title="Möchtest du deine Daten spenden?"
        theme="gray"
        icon={faFileHeart}
      >
        <p>
          Deine Daten werden pseudonymisiert und ausschließlich mit
          DataSkop-Partnern geteilt. Sie helfen uns, TikTok besser zu verstehen.
          Du behältst nach der Spende die Kontrolle über deine Daten und kannst
          sie jederzeit löschen.
        </p>
      </Content>
    </WizardLayout>
  );
}
