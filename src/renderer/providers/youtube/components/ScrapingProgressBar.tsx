/* eslint-disable react-hooks/exhaustive-deps */
import { faSpinnerThird } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useScraping } from "renderer/contexts";
import { providerInfo } from "renderer/providers/info";

const ScrapingProgressBar = () => {
  const {
    state: {
      campaign,
      visibleWindow,
      scrapingProgress: { isActive, value },
      startedAt,
      finishedTasks,
      demoData,
    },
    dispatch,
  } = useScraping();

  /**
   * A quick and dirty way to compute an ETA based on the demo data.
   */
  const getEtaUntil = (checkUntilStep = null) => {
    if (campaign === null) return null;
    if (demoData === null) return null;
    if (startedAt === null) return null;

    const demoDataObj =
      providerInfo[campaign.config.provider].demoData[demoData.data];

    const untilIndex = checkUntilStep || demoDataObj.results.length - 1;

    const finishedFixed =
      finishedTasks - 1 < demoDataObj.results.length
        ? finishedTasks - 1
        : demoDataObj.results.length - 1;

    const demoStartedAt = demoDataObj.results[0].scrapedAt - 10000; // ~ 10 seconds
    const demoTime = demoDataObj.results[finishedFixed].scrapedAt;
    const demoDuration = demoTime - demoStartedAt;
    const demoRemaining = demoDataObj.results[untilIndex].scrapedAt - demoTime;

    const ourTime = Date.now() - startedAt;

    const etaRemaining = (ourTime / demoDuration) * demoRemaining;

    return etaRemaining;
  };

  const [etaMin, setEtaMin] = useState("15 Minuten");

  useEffect(() => {
    if (finishedTasks > 5) {
      const etaMs = getEtaUntil();
      if (etaMs === null) return;
      const minutes = Math.round(etaMs / 1000 / 60);
      if (minutes >= 2) {
        setEtaMin(`${minutes} Minuten`);
      } else if (minutes === 1) {
        setEtaMin("eine Minute");
      } else {
        setEtaMin("unter eine Minute");
      }
    } else {
      setEtaMin("15 Minuten");
    }
  }, [finishedTasks]);

  if (!isActive) {
    return null;
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="w-64 h-10 relative flex items-center cursor-pointer group"
      onClick={() =>
        dispatch({ type: "set-visible-window", visibleWindow: !visibleWindow })
      }
    >
      <div className="z-20 w-full flex items-center justify-center px-2 space-x-2 text-yellow-1300 group-hover:text-yellow-1100">
        <FontAwesomeIcon icon={faSpinnerThird} spin size="sm" className="" />
        <div className="relative text-sm whitespace-nowrap pr-3">
          Scraping: Noch ca. {etaMin}
        </div>
      </div>
      <div className="z-0 absolute bottom-0 inset-x-0 h-1 bg-yellow-300">
        <div
          className="bg-yellow-700 h-full"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ScrapingProgressBar;
