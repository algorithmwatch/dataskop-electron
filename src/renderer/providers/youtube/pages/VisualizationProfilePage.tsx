import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useNavigation, useScraping } from "renderer/contexts";
import FooterNav, {
  FooterNavItem,
} from "renderer/providers/youtube/components/FooterNav";
import VisualizationWrapper from "../components/VisualizationWrapper";

const VisualizationProfilePage = (): JSX.Element => {
  const { getNextPage, getPreviousPage } = useNavigation();
  const [nextButtonIsDisabled, setNextButtonIsDisabled] = useState(true);

  const {
    state: {
      scrapingProgress: { step },
      campaign,
      demoMode,
    },
  } = useScraping();

  useEffect(() => {
    if (campaign === null) return;
    const stepIndex = campaign.config.steps.findIndex(
      (s) => s.type === "profile",
    );
    if (demoMode || step > stepIndex) {
      setNextButtonIsDisabled(false);
    }
  }, [step, demoMode]);

  const footerNavItems: FooterNavItem[] = [
    {
      label: "Zurück",
      theme: "link",
      startIcon: faAngleLeft,
      clickHandler(history: RouteComponentProps["history"]) {
        history.push(getPreviousPage("path"));
      },
    },
    {
      label: "Weiter",
      // size: 'large',
      endIcon: faAngleRight,
      disabled: nextButtonIsDisabled,
      tippyOptions: nextButtonIsDisabled
        ? {
            content: "Bitte warte, bis alle Daten geladen sind.",
            theme: "process-info",
            placement: "left",
          }
        : undefined,
      clickHandler(history: RouteComponentProps["history"]) {
        if (!nextButtonIsDisabled) {
          history.push(getNextPage("path"));
        }
      },
    },
  ];

  return (
    <>
      <VisualizationWrapper name="profile" />
      <FooterNav items={footerNavItems} />
    </>
  );
};

export default VisualizationProfilePage;
