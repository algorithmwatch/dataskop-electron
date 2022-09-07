import { useEffect, useState } from "react";
import { useScraping } from "../../../contexts";
import { getScrapingResultsBySession } from "../../../lib/db";
import AutoplayChain from "./visualizations/AutoplayChain";
import MyData from "./visualizations/MyData";
import NewsTop5 from "./visualizations/NewsTop5";
import Profile from "./visualizations/profile";
import SearchResultsCompare from "./visualizations/SearchResultsCompare";

export default function VisualizationWrapper({ name }: { name: string }) {
  const [data, setData] = useState<any>(null);

  const {
    state: { sessionId, scrapingProgress, demoMode, demoData },
  } = useScraping();

  useEffect(() => {
    const loadData = async () => {
      if (demoData) {
        // migrate outdated lookup format
        if (
          "lookups" in demoData.data &&
          Array.isArray(demoData.data.lookups)
        ) {
          const transformed = Object.assign(
            {},
            ...demoData.data.lookups.map((x) => ({
              [x.info.videoId]: { data: x.info },
            })),
          );
          setData({ results: demoData.data.results, lookups: transformed });
        } else setData(demoData.data);
      } else if (sessionId) {
        const results = await getScrapingResultsBySession(sessionId);
        const lookups = await window.electron.ipc.invoke("db-get-lookups");
        setData({ results, lookups });
      }
    };
    loadData();
  }, [
    demoMode,
    demoData,
    sessionId,
    scrapingProgress.value,
    scrapingProgress.step,
  ]);

  if ((!demoMode && !sessionId) || data === null) return null;

  if (name === "autoplaychain") {
    return <AutoplayChain data={data.results} />;
  }
  if (name === "newstop5") {
    return <NewsTop5 data={data.results} />;
  }
  if (name === "searchresultscompare") {
    return <SearchResultsCompare data={data.results} />;
  }
  if (name === "profile") {
    return <Profile data={data.results} lookups={data.lookups} />;
  }
  if (name === "mydata") {
    return <MyData data={data} />;
  }

  return null;
}
