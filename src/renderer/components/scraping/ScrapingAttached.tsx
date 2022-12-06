/**
 * Add the scraping based on a global state ('isAttached').
 *
 * @module
 */
import { useEffect } from "react";
import { useConfig, useScraping } from "renderer/contexts";
import ScrapingManager from "./ScrapingManager";

export default function ScrapingAttached() {
  const {
    state: { isAttached, disableInput, campaign, scrapingProgress },
    dispatch,
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
