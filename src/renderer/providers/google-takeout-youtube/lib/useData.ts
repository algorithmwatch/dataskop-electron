import { useMemo, useState } from "react";
import { useScraping } from "renderer/contexts";

const useData = (
  options: { maxLookups?: number; dumpPicks?: string[] } = {
    maxLookups: undefined,
    dumpPicks: [],
  },
) => {
  const [result, setResult] = useState<null | any>(null);

  const {
    state: { campaign },
  } = useScraping();

  const scrapeConfig = campaign?.config.steps.filter(
    (x) => x.slug === "gtyt-scraping-watched-videos",
  )[0];

  const maxLookups = options.maxLookups ?? scrapeConfig.maxVideos;

  useMemo(() => {
    (async () => {
      const newResult = await window.electron.ipc.invoke(
        "google-takout-youtube-use-data",
        maxLookups,
      );
      setResult(newResult);
    })();
  }, []);
  if (result === null) return { dump: null, lookups: null };
  return { dump: result[0], lookups: result[1] };
};

export { useData };
