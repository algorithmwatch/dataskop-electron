/**
 * Control buttons for the scraping, mostly used for debugging.
 *
 * @module
 */
import { useScraping } from "renderer/contexts";
import { providerInfo } from "renderer/providers/info";
import Button from "../../providers/youtube/components/Button";
import { goToUrl } from "./ipc";

export default function ScrapingControls({
  hideControls = false,
}: {
  hideControls?: boolean;
}): JSX.Element {
  const {
    state: {
      campaign,
      isUserLoggedIn,
      isScrapingStarted,
      isScrapingPaused,
      isScrapingFinished,
      scrapingError,
      isMuted,
      scrapingProgress,
      visibleWindow,
    },
    dispatch,
  } = useScraping();

  const resetScraping = async () => {
    if (campaign) {
      await goToUrl(providerInfo[campaign.config.provider].loginUrl, {
        clear: true,
      });
    }
    dispatch({ type: "reset-scraping" });
  };

  // controls for the scraping

  const pauseScraping = () => {
    dispatch({ type: "set-scraping-paused", paused: true });
  };

  const resumeScraping = () => {
    dispatch({ type: "set-scraping-paused", paused: false });
  };

  const toggleIsMuted = () => {
    dispatch({ type: "set-muted", muted: !isMuted });
  };

  const toggleVis = () => {
    dispatch({ type: "set-visible-window", visibleWindow: !visibleWindow });
  };

  const startScraping = () => {
    dispatch({ type: "start-scraping" });
  };

  return (
    <>
      <div>
        <p style={{ color: "red" }}>
          {scrapingError !== null &&
            `${scrapingError.name}: ${scrapingError.message}`}
        </p>
        <br />
        <div className={hideControls ? "invisible" : ""}>
          <Button onClick={resetScraping}>reset scraping</Button>
          {!isUserLoggedIn && <p>Please login before continuing.</p>}
          {isUserLoggedIn && !isScrapingStarted && (
            <Button onClick={startScraping}>start scraping</Button>
          )}
          {!isScrapingFinished && isScrapingStarted && !isScrapingPaused && (
            <Button onClick={pauseScraping}>pause scraping</Button>
          )}
          {!isScrapingFinished && isScrapingStarted && isScrapingPaused && (
            <Button onClick={resumeScraping}>resume scraping</Button>
          )}

          <Button onClick={toggleIsMuted}>is {!isMuted && "not"} muted</Button>
          <Button onClick={toggleVis}>
            {!visibleWindow ? "show" : "hide"} scraping window
          </Button>
        </div>
        {isScrapingStarted && (
          <progress className="progress" value={scrapingProgress.value} max="1">
            {scrapingProgress.value}
          </progress>
        )}
      </div>
    </>
  );
}
