/**
 * TODO: For TikTok
 *
 * @module
 */
import { faFileHeart } from "@fortawesome/pro-light-svg-icons";
import { faAngleLeft } from "@fortawesome/pro-solid-svg-icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import Content from "renderer/providers/tiktok/components/Content";
import { useNavigation } from "../../../contexts";

const DonationChoicePage = (): JSX.Element => {
  const { getPreviousPage } = useNavigation();
  const history = useHistory();
  const [canDonate, setCanDonate] = useState<true | null>(null);

  useEffect(() => {
    (async () => {
      const can = await window.electron.ipc.invoke("tiktok-eligible-to-donate");
      if (can) setCanDonate(true);
      else {
        window.electron.log.info(
          "According to the date of birth in the dump, the user is underage. Skipping donation.",
        );
        window.notEligibleToDonate = true;
        history.push("/tiktok/thank_you");
      }
    })();
  }, []);

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

  if (canDonate === null) <div />;

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
};

export default DonationChoicePage;
