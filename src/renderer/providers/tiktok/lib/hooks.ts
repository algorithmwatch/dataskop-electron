import { useEffect, useState } from "react";

const useData = () => {
  const [dump, setDump] = useState<null | JSON>(null);

  useEffect(() => {
    (async () => {
      setDump(await window.electron.ipc.invoke("scraping-get-download"));
    })();
  }, []);

  const getLookups = (ids, max = 0) =>
    window.electron.ipc.invoke("tiktok-get-lookups", ids, max);

  return { dump, getLookups };
};

export { useData };
