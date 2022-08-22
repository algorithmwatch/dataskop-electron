/**
 * Show page after successful login.
 *
 * @module
 */

import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import WizardLayout from "renderer/components/WizardLayout";
import { useNavigation, useScraping } from "../contexts";

export default function ProviderLoginSuccessPage(): JSX.Element {
  const {
    state: { isUserLoggedIn },
    dispatch,
  } = useScraping();
  const history = useHistory();
  const { getNextPage } = useNavigation();

  const footerButtons = [
    <Button key="1" startIcon={faAngleLeft} disabled>
      Zurück
    </Button>,
    <Button
      key="2"
      startIcon={faAngleRight}
      onClick={() => {
        history.push(getNextPage("path"));
      }}
    >
      Weiter
    </Button>,
  ];

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
    dispatch({ type: "set-scraping-started", started: true });
    // }
  }, []);

  return (
    <WizardLayout className="text-center" footerButtons={footerButtons}>
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
