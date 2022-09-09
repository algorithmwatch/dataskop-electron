import { useEffect, useMemo, useState } from "react";

const useData = () => {
  const [dump, setDump] = useState<null | JSON>(null);

  useMemo(() => {
    (async () => {
      setDump(await window.electron.ipc.invoke("scraping-get-download"));
    })();
  }, []);

  const getLookups = (ids: string[], max = 0) =>
    window.electron.ipc.invoke("tiktok-get-lookups", ids, max);

  return { dump, getLookups };
};

const useScraping = (ids, max) => {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await window.electron.ipc.invoke("tiktok-get-lookups", ids, max);
        setDone(true);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  return { error, done };
};

export { useData, useScraping };
