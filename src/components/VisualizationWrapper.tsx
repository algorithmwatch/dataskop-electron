import React, { useEffect, useState } from 'react';
import { useScraping } from '../contexts';
import { getScrapingResultsBySession } from '../db';
import AutoplayChain from './visualizations/AutoplayChain';
import NewsTop5 from './visualizations/NewsTop5';
import Profile from './visualizations/profile';
import SearchResultsCompare from './visualizations/SearchResultsCompare';

export default function VisualizationWrapper({ name }: { name: string }) {
  const [data, setData] = useState<any>([]);

  const {
    state: { sessionId, scrapingProgress },
  } = useScraping();

  useEffect(() => {
    const loadData = async () => {
      if (sessionId) {
        setData(await getScrapingResultsBySession(sessionId));
      }
    };
    loadData();
  }, [sessionId, scrapingProgress.value, scrapingProgress.step]);

  if (!sessionId) return null;

  if (name === 'autoplaychain') {
    return <AutoplayChain data={data} />;
  }
  if (name === 'newstop5') {
    return <NewsTop5 data={data} />;
  }
  if (name === 'searchresultscompare') {
    return <SearchResultsCompare data={data} />;
  }
  if (name === 'profile') {
    return <Profile data={data} />;
  }

  return null;
}
