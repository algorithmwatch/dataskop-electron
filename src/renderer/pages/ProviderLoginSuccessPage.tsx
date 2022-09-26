/**
 * Show page after successful login.
 *
 * @module
 */

import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation, useScraping } from "../contexts";

export default function ProviderLoginSuccessPage(): JSX.Element {
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
      filterSteps: (x) => x.slug === "tt-data-export-monitoring",
    });
  }, []);

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <h1 className="hl-4xl mb-20">Success</h1>
      <div className="flex flex-col space-y-4">
        <p></p>
      </div>
    </WizardLayout>
  );
}
