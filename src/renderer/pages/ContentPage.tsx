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
  nextPath,
  prevPath,
}: {
  title: string;
  children: JSX.Element;
  nextPath?: string;
  prevPath?: string;
}): JSX.Element => {
  const { getNextPage, getPreviousPage, hasNextPage, hasPrevPage } =
    useNavigation();
  const history = useHistory();

  const footerSlots: FooterSlots = {
    center: [],
  };

  if (prevPath !== "" && (!!prevPath || hasPrevPage()) && footerSlots.center) {
    footerSlots.center.push([
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          history.push(prevPath || getPreviousPage("path"));
        }}
      >
        Zurück
      </Button>,
    ]);
  }

  if (nextPath !== "" && (!!nextPath || hasNextPage()) && footerSlots.center) {
    footerSlots.center.push(
      <Button
        key="2"
        endIcon={faAngleRight}
        onClick={() => {
          history.push(nextPath || getNextPage("path"));
        }}
      >
        Weiter
      </Button>,
    );
  }

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <Content title={title} theme="transparent">
        <div className="space-y-6 text-xl max-w-prose">{children}</div>
      </Content>
    </WizardLayout>
  );
};

export default ContentPage;
