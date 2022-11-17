/**
 * Add the scraping based on a global state ('isAttached').
 *
 * @module
 */
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useConfig, useScraping } from "renderer/contexts";
import { currentDelay } from "renderer/lib/delay";
import { isMonitoringPending } from "renderer/providers/tiktok/lib/status";
import ScrapingManager from "./ScrapingManager";

export default function ScrapingAttached() {
  const {
    state: {
      isAttached,
      disableInput,
      campaign,
      isScrapingStarted,
      isScrapingFinished,
      scrapingProgress,
    },
    dispatch,
  } = useScraping();

  const {
    state: { userConfig },
    dispatch: configDispatch,
  } = useConfig();

  const history = useHistory();

  // Some monitoring logic because this component gets rendered on initialization.

  useEffect(() => {
    (async () => {
      window.electron.log.info("Check if should start a monitoring step");
      if (userConfig && userConfig.monitoring && !isScrapingStarted) {
        window.electron.log.info("Yes, start a monitoring step");

        dispatch({ type: "set-attached", attached: true, visible: false });
        await currentDelay();
        dispatch({
          type: "start-scraping",
          filterSteps: (x) => x.slug === "tt-data-export-monitoring",
        });

        // Attach
        // Check if loggend in, then act
        // Start scraping
      } else {
        window.electron.log.info("No, don't start a monitoring step");
      }
    })();
  }, [userConfig?.monitoring, isScrapingStarted]);

  useEffect(() => {
    (async () => {
      window.electron.log.info("Check if monitoring is done");
      if (userConfig && userConfig.monitoring && isScrapingFinished) {
        window.electron.log.info("Yes, monitoring is done");
        configDispatch({
          type: "set-user-config",
          newValues: { monitoring: false },
        });
        dispatch({ type: "reset-scraping" });
        dispatch({ type: "set-attached", attached: false, visible: false });
        window.electron.ipc.invoke("monitoring-done");
        // Disable monitoring flag
        // Process post-monitoring result
        // Notify main about finished monitoring

        // If something went wrong, ask them to check again. If not's working to report to us.
      } else {
        window.electron.log.info("No, monitoring is not done");
      }
    })();
  }, [userConfig?.monitoring, isScrapingFinished]);

  // Jump to waiting screen
  useEffect(() => {
    (async () => {
      window.electron.log.info("Check if we should jump to waiting page");
      const isPending = await isMonitoringPending();
      if (userConfig && !userConfig.monitoring && isPending) {
        window.electron.log.info(
          `Yes, jump to waiting page. history: ${!!history}`,
        );
        // Add some timeout because a race condition prevented a navigation.
        setTimeout(() => {
          history.push("/tiktok/waiting");
        }, 500);
      } else {
        window.electron.log.info(
          `No, don't jump to waiting page. Pending: ${isPending}. Monitoring: ${userConfig?.monitoring}`,
        );
      }
    })();
  }, [userConfig?.monitoring]);

  useEffect(() => {
    window.hasDonated = null;
  });

  // Expose the status of the scraping to the main process to check wheter the
  // can safely be closed.
  useEffect(() => {
    window.electron.ipc.removeAllListeners("close-action");
    window.electron.ipc.on("close-action", () => {
      window.electron.ipc.invoke(
        "close-main-window",
        scrapingProgress.isActive,
        window.hasDonated !== null,
      );
    });
  }, [scrapingProgress.isActive, window.hasDonated]);

  // Only render scraping manger when the campaign is set to avoid tedious guard clauses.
  if (isAttached && campaign && userConfig)
    return (
      <ScrapingManager
        disableInput={disableInput}
        campaign={campaign}
        userConfig={userConfig}
      />
    );
  return null;
}
