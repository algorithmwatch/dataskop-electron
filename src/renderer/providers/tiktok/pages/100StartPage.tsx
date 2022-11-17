/**
 * TODO: For TikTok
 *
 * @module
 */
import { faAngleRight } from "@fortawesome/pro-regular-svg-icons";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "renderer/components/Button";
import { currentDelay } from "renderer/lib/delay";
import { useConfig, useNavigation, useScraping } from "../../../contexts";
import awlogo from "../../../static/images/logos/aw-logo.png";
import bmbflogo from "../../../static/images/logos/bmbf-logo.png";
import enslogo from "../../../static/images/logos/ens-logo.png";
import fhplogo from "../../../static/images/logos/fhp-logo.png";
import mplogo from "../../../static/images/logos/mp-logo.png";
import uplogo from "../../../static/images/logos/up-logo.png";
import { shouldJumpToWaitingPage } from "../lib/status";
import dslogo from "../static/images/logo.svg";

export default function StartPage(): JSX.Element {
  const { getNextPage } = useNavigation();
  const history = useHistory();

  const {
    state: { isScrapingStarted, isScrapingFinished },
    dispatch,
  } = useScraping();

  const {
    state: { userConfig },
    dispatch: configDispatch,
  } = useConfig();

  // Some monitoring logic because this component gets rendered on initialization.

  useEffect(() => {
    (async () => {
      // Don't process if scraping is already started
      if (!userConfig || isScrapingStarted) return;

      if (userConfig.monitoring) {
        window.electron.log.info("Do a monitoring step");

        dispatch({ type: "set-attached", attached: true, visible: false });
        await currentDelay();
        dispatch({
          type: "start-scraping",
          filterSteps: (x) => x.slug === "tt-data-export-monitoring",
        });
      }
    })();
  }, [userConfig?.monitoring]);

  useEffect(() => {
    (async () => {
      // Don't need to process if not monitoring mode is active
      if (!userConfig || !userConfig.monitoring) return;

      if (isScrapingFinished) {
        window.electron.log.info("Monitoring is done");
        // Disable monitoring flag
        configDispatch({
          type: "set-user-config",
          newValues: { monitoring: false },
        });
        dispatch({ type: "reset-scraping" });
        dispatch({ type: "set-attached", attached: false, visible: false });
        window.electron.ipc.invoke("monitoring-done");
        // Process post-monitoring result
        // Notify main about finished monitoring
      }
    })();
  }, [isScrapingFinished]);

  // Jump to waiting screen
  useEffect(() => {
    (async () => {
      // Don't jump in monitoring mode
      if (!userConfig || userConfig.monitoring) return;

      const doJump = await shouldJumpToWaitingPage();
      if (doJump) {
        window.electron.log.info(`Jump to waiting page`);
        // Add some timeout because a race condition prevented a navigation.
        setTimeout(() => {
          history.push("/tiktok/waiting");
        }, 0);
      } else {
        window.electron.log.info(
          `Don't jump to waiting page. DoJump: ${doJump}. Monitoring: ${userConfig?.monitoring}`,
        );
      }
    })();
  }, [userConfig?.monitoring]);

  const hadnleNextClick = () => {
    history.push(getNextPage("path"));
  };

  return (
    <>
      <div className="grow mx-auto flex flex-col h-full min-h-0">
        <div className="grow flex flex-col justify-center items-center max-h-[65%] h-full">
          <img src={dslogo} alt="Dataskop Logo" className="w-80 mx-auto" />
          <div className="mt-6">
            <Button endIcon={faAngleRight} onClick={hadnleNextClick}>
              Start
            </Button>
          </div>
        </div>
        <div className="flex pb-8">
          <div className="text-center">
            <div className="font-bold mb-3">Partner:</div>
            <div className="flex flex-wrap items-center justify-center mb-5 max-w-xl">
              <img
                src={awlogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
              <img
                src={enslogo}
                alt=""
                className="mx-3 py-1 block w-20 h-auto"
              />
              <img
                src={uplogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
              <img
                src={fhplogo}
                alt=""
                className="mx-3 py-1 block w-48 h-auto"
              />
              <img
                src={mplogo}
                alt=""
                className="mx-3 py-1 block w-36 h-auto"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold">Gefördert durch:</div>
            <img src={bmbflogo} alt="" className="block w-52 mx-auto -mt-1" />
          </div>
        </div>
      </div>
    </>
  );
}
