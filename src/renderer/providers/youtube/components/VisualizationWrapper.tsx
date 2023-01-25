import { useEffect, useState } from "react";
import { providerInfo } from "renderer/providers/info";
import { useScraping } from "../../../contexts";
import { getScrapingResultsBySession } from "../../../lib/db";
import AutoplayChain from "./visualizations/AutoplayChain";
import MyData from "./visualizations/MyData";
import NewsTop5 from "./visualizations/NewsTop5";
import Profile from "./visualizations/profile";
import SearchResultsCompare from "./visualizations/SearchResultsCompare";

const VisualizationWrapper = ({ name }: { name: string }) => {
  const [data, setData] = useState<any>(null);

  const {
    state: { sessionId, scrapingProgress, demoMode, demoData, campaign },
  } = useScraping();

  useEffect(() => {
    (async () => {
      if (demoData && campaign) {
        const demoDataObj =
          providerInfo[campaign.config.provider].demoData[demoData.data];

        // migrate outdated lookup format
        if ("lookups" in demoDataObj && Array.isArray(demoDataObj.lookups)) {
          const transformed = Object.assign(
            {},
            ...demoDataObj.lookups.map((x) => ({
              [x.info.videoId]: { data: x.info },
            })),
          );
          setData({ results: demoDataObj.results, lookups: transformed });
        } else {
          setData(demoDataObj);
        }
      } else if (sessionId) {
        const results = await getScrapingResultsBySession(sessionId);
        const lookups = await window.electron.ipc.invoke("db-get-lookups");
        setData({ results, lookups });
      }
    })();
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
};

export default VisualizationWrapper;
