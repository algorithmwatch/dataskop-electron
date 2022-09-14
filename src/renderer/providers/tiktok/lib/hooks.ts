import { useMemo, useState } from "react";

const useData = () => {
  const [dump, setDump] = useState<null | JSON>(null);

  useMemo(() => {
    (async () => {
      setDump(await window.electron.ipc.invoke("scraping-get-download"));
    })();
  }, []);

  const getLookups = (ids: string[]) =>
    window.electron.ipc.invoke("db-get-lookups", ids);

  return { dump, getLookups };
};

export { useData };
