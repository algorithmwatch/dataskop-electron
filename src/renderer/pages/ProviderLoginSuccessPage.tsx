/**
 * Show page after successful login.
 *
 * @module
 */

import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import StatusContent from "renderer/providers/tiktok/components/StatusContent";
import { useNavigation, useScraping } from "../contexts";

const ProviderLoginSuccessPage = (): JSX.Element => {
  const {
    state: { isScrapingFinished },
    dispatch,
  } = useScraping();
  const history = useHistory();
  const { getNextPage } = useNavigation();

  const footerSlots: FooterSlots = {
    center: [],
  };

  useEffect(() => {
    if (isScrapingFinished) {
      history.push(getNextPage("path"));
    }
  }, [isScrapingFinished]);

  useEffect(() => {
    // TikTok specific
    dispatch({
      type: "start-scraping",
      filterSteps: (x) => x.slug === "tt-data-export",
    });
  }, []);

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <StatusContent
        title="Einen Moment, bitte"
        body="Wir beantragen gerade deine Daten bei TikTok."
        status={null}
      />
    </WizardLayout>
  );
};

export default ProviderLoginSuccessPage;
