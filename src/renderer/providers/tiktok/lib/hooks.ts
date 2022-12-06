import { getMostRecentWatchVideos } from "@algorithmwatch/schaufel-wrangle";
import { useMemo, useState } from "react";

const useData = (maxVideos = 0) => {
  const [dump, setDump] = useState<null | JSON>(null);
  const [lookups, setLookups] = useState<null | JSON>(null);

  useMemo(() => {
    (async () => {
      const newDump = await window.electron.ipc.invoke("downloads-get");
      setDump(newDump);

      if (maxVideos > 0) {
        const ids = getMostRecentWatchVideos(newDump, maxVideos, null);
        setLookups(await window.electron.ipc.invoke("db-get-lookups", ids));
      }
    })();
  }, []);

  const getLookups = (ids: string[]) =>
    window.electron.ipc.invoke("db-get-lookups", ids);

  return { dump, lookups, getLookups };
};

export { useData };
