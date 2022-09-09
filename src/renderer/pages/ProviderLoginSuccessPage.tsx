/**
 * Show page after successful login.
 *
 * @module
 */

import { faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import WizardLayout, { FooterSlots } from "renderer/components/WizardLayout";
import { useNavigation, useScraping } from "../contexts";

export default function ProviderLoginSuccessPage(): JSX.Element {
  const {
    state: { isUserLoggedIn },
    dispatch,
  } = useScraping();
  const history = useHistory();
  const { getNextPage } = useNavigation();

  const footerSlots: FooterSlots = {
    center: [
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

  useEffect(() => {
    if (isUserLoggedIn) {
      // hide login window
      // dispatch({ type: 'set-visible-window', visibleWindow: false });
      // go to next page
      // hist.push(getNextPage('path'));
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    // if (isUserLoggedIn && !isScrapingStarted) {

    // start scraping
    dispatch({ type: "start-scraping" });
    // }
  }, []);

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <h1 className="hl-4xl mb-20">Success</h1>
      <div className="flex flex-col space-y-4">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo expedita
          delectus fugit aliquam qui! Nulla, quo. Autem pariatur velit
          repellendus ipsum corporis odit vero, facilis, possimus ex nam ratione
          delectus.
        </p>
      </div>
    </WizardLayout>
  );
}
