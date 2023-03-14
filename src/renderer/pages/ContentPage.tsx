/**
 * Generic content page
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import Content from "renderer/components/Content";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation } from "../contexts";

const ContentPage = ({
  title,
  children,
}: {
  title: string;
  children: JSX.Element;
}): JSX.Element => {
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
      <Content title={title} theme="transparent">
        <div className="space-y-6 text-xl max-w-prose">{children}</div>
      </Content>
    </WizardLayout>
  );
};

export default ContentPage;
