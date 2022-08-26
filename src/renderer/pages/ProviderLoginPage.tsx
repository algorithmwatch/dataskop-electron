/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * Login to provider.
 *
 * @module
 */
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import WizardLayout from "renderer/components/WizardLayout";
import { useConfig, useNavigation, useScraping } from "../contexts";

export default function ProviderLoginPage(): JSX.Element {
  const { getNextPage, getPreviousPage } = useNavigation();
  const history = useHistory();
  const {
    state: { isUserLoggedIn, campaign },
    dispatch,
  } = useScraping();
  const hist = useHistory();
  const { sendEvent } = useConfig();

  const footerSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          dispatch({ type: "set-visible-window", visibleWindow: false });
          history.push(getPreviousPage("path"));
        }}
      >
        Zurück
      </Button>,
    ],
  };

  if (process.env.NODE_ENV === "development") {
    footerSlots.center.push(
      <Button
        key="2"
        endIcon={faAngleRight}
        onClick={() => {
          history.push(getNextPage("path"));
        }}
      >
        Weiter
      </Button>,
    );
  }

  useEffect(() => {
    if (isUserLoggedIn) {
      // hide login window

      // dispatch({ type: 'set-visible-window', visibleWindow: false });

      // go to next page
      hist.push(getNextPage("path"));
    }
  }, [isUserLoggedIn]);

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <h1 className="hl-4xl mb-20">Login bei Provider</h1>
      <div className="flex flex-col space-y-4">
        <Button
          onClick={() => {
            dispatch({
              type: "set-attached",
              attached: true,
              visible: true,
            });
            sendEvent(campaign, "clicked start scraping");
          }}
        >
          Anmelden
        </Button>
        <Button
          onClick={() => {
            window.electron.ipc.invoke("scraping-clear-storage");
            // dispatch({ type: 'reset-scraping' });
          }}
        >
          Reset storage
        </Button>
      </div>
    </WizardLayout>
  );
}
