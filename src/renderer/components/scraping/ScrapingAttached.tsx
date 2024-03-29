/**
 * Add the scraping based on a global state ('isAttached').
 *
 * @module
 */
import { useEffect } from "react";
import { useConfig, useScraping } from "renderer/contexts";
import ScrapingManager from "./ScrapingManager";

const ScrapingAttached = () => {
  const {
    state: { isAttached, disableInput, campaign, scrapingProgress },
  } = useScraping();

  const {
    state: { userConfig },
  } = useConfig();

  useEffect(() => {
    // Set flag so we now that the user hasn't reached the donation page
    window.hasDonated = null;
  }, []);

  // Expose the status of the scraping to the main process to check wheter the
  // can safely be closed.
  useEffect(() => {
    const cleanUp = window.hasDonated !== null || window.clearImports;
    window.electron.ipc.removeAllListeners("close-action");
    window.electron.ipc.on("close-action", () => {
      window.electron.ipc.invoke(
        "close-main-window",
        scrapingProgress.isActive,
        cleanUp,
        !!window.reachedEnd,
      );
    });
  }, [scrapingProgress.isActive, window.hasDonated, window.reachedEnd]);

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
};

export default ScrapingAttached;
