import { getMostRecentWatchVideos } from "@algorithmwatch/schaufel-wrangle";
import { useMemo, useState } from "react";
import { useScraping } from "renderer/contexts";

const useData = (
  options: { maxLookups?: number; dumpPicks?: string[] } = {
    maxLookups: undefined,
    dumpPicks: [],
  },
) => {
  const [dump, setDump] = useState<null | JSON>(null);
  const [lookups, setLookups] = useState<null | JSON>(null);

  const {
    state: { campaign },
  } = useScraping();

  const scrapeConfig = campaign?.config.steps.filter(
    (x) => x.slug === "tt-scrape-watched-videos",
  )[0];

  const maxLookups = options.maxLookups ?? scrapeConfig.maxVideos;
  const { minWatchedSeconds } = scrapeConfig;

  useMemo(() => {
    (async () => {
      const newDump = await window.electron.ipc.invoke(
        "downloads-get",
        options.dumpPicks ?? [],
      );
      setDump(newDump);

      if (maxLookups && maxLookups > 0) {
        const ids = getMostRecentWatchVideos(
          newDump,
          maxLookups,
          minWatchedSeconds,
        );
        setLookups(await window.electron.ipc.invoke("db-get-lookups", ids));
      }
    })();
  }, []);

  return { dump, lookups };
};

export { useData };
