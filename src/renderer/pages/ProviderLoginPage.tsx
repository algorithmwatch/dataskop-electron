/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * Login to provider.
 *
 * @module
 */
import { faAngleLeft } from "@fortawesome/pro-solid-svg-icons";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import WizardLayout from "renderer/components/WizardLayout";
import { useConfig, useNavigation, useScraping } from "../contexts";

const ProviderLoginPage = (): JSX.Element => {
  const { getNextPage } = useNavigation();
  const history = useHistory();
  const {
    state: { isUserLoggedIn, campaign },
    dispatch,
  } = useScraping();
  const { sendEvent } = useConfig();

  const footerSlots = {
    center: [
      <Button
        key="1"
        theme="text"
        startIcon={faAngleLeft}
        onClick={() => {
          history.goBack();
          dispatch({ type: "reset-scraping" });
          dispatch({
            type: "set-attached",
            attached: false,
            visible: false,
            fixed: true,
            initPositionWindow: "center-top",
          });
          window.electron.ipc.invoke("scraping-clear-storage");
        }}
      >
        Zurück
      </Button>,
    ],
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      dispatch({ type: "set-visible-window", visibleWindow: false });
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
      <div className="flex flex-col space-y-4" />
    </WizardLayout>
  );
};

export default ProviderLoginPage;
