import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { RouteComponentProps } from "react-router-dom";
import { useNavigation, useScraping } from "../../../contexts";
import FooterNav, { FooterNavItem } from "../components/FooterNav";
import VisualizationWrapper from "../components/VisualizationWrapper";

const VisualizationAutoplayChainPage = () => {
  const { getNextPage, getPreviousPage } = useNavigation();
  const {
    state: { isScrapingFinished, demoMode },
  } = useScraping();
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
      disabled: !isScrapingFinished && !demoMode,
      tippyOptions:
        !isScrapingFinished && !demoMode
          ? {
              content: "Bitte warte, bis alle Daten geladen sind.",
              theme: "process-info",
              placement: "left",
            }
          : undefined,
      clickHandler(history: RouteComponentProps["history"]) {
        if (isScrapingFinished || demoMode) {
          history.push(getNextPage("path"));
        }
      },
    },
  ];

  return (
    <>
      <VisualizationWrapper name="autoplaychain" />
      <FooterNav items={footerNavItems} />
    </>
  );
};

export default VisualizationAutoplayChainPage;
