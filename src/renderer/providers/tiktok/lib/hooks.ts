import { getMostRecentWatchVideos } from "@algorithmwatch/schaufel-wrangle";
import { useMemo, useState } from "react";

const useData = (
  options: { maxLookups?: number; dumpPicks?: string[] } = {
    maxLookups: 0,
    dumpPicks: [],
  },
) => {
  const [dump, setDump] = useState<null | JSON>(null);
  const [lookups, setLookups] = useState<null | JSON>(null);

  useMemo(() => {
    (async () => {
      const newDump = await window.electron.ipc.invoke(
        "downloads-get",
        options.dumpPicks ?? [],
      );
      setDump(newDump);

      if (options.maxLookups && options.maxLookups > 0) {
        const ids = getMostRecentWatchVideos(newDump, options.maxLookups, null);
        setLookups(await window.electron.ipc.invoke("db-get-lookups", ids));
      }
    })();
  }, []);

  const getLookups = (ids: string[]) =>
    window.electron.ipc.invoke("db-get-lookups", ids);

  return { dump, lookups, getLookups };
};

export { useData };
