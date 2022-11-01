import { getMostRecentWatchVideos } from "@algorithmwatch/schaufel-wrangle";
import { useMemo, useState } from "react";

const useData = (maxVideos = 200) => {
  const [dump, setDump] = useState<null | JSON>(null);
  const [lookups, setLookups] = useState<null | JSON>(null);

  useMemo(() => {
    (async () => {
      const newDump = await window.electron.ipc.invoke("scraping-get-download");
      setDump(newDump);

      const ids = getMostRecentWatchVideos(newDump, maxVideos, null);
      setLookups(await window.electron.ipc.invoke("db-get-lookups", ids));
    })();
  }, []);

  const getLookups = (ids: string[]) =>
    window.electron.ipc.invoke("db-get-lookups", ids);

  return { dump, lookups, getLookups };
};

export { useData };
