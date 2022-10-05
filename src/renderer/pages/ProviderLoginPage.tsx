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
  const { getNextPage } = useNavigation();
  const history = useHistory();
  const {
    state: { isUserLoggedIn, campaign },
    dispatch,
  } = useScraping();
  const {
    sendEvent,
    state: { isDebug },
  } = useConfig();

  const footerSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          dispatch({ type: "set-visible-window", visibleWindow: false });
          history.goBack();
        }}
      >
        Zurück
      </Button>,
    ],
  };

  if (isDebug) {
    footerSlots.center.push(
      <Button
        key="2"
        endIcon={faAngleRight}
        onClick={() => {
          history.push(getNextPage("path"));
        }}
      >
        DEBUG ONLY: Weiter
      </Button>,
    );
  }

  useEffect(() => {
    if (isUserLoggedIn) {
      history.push(getNextPage("path"));
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    dispatch({
      type: "set-attached",
      attached: true,
      visible: true,
      fixed: true,
      initPositionWindow: "center-top",
    });
    sendEvent(campaign, "clicked start scraping");
  }, []);

  return (
    <WizardLayout className="text-center" footerSlots={footerSlots}>
      <h1 className="hl-4xl mb-20">Login bei Provider</h1>
      <div className="flex flex-col space-y-4"></div>
    </WizardLayout>
  );
}
