import React, { useEffect, useState } from 'react';
import demoData from '../constants/demo.json';
import { useScraping } from '../contexts';
import { getLookups, getScrapingResultsBySession } from '../db';
import AutoplayChain from './visualizations/AutoplayChain';
import MyData from './visualizations/MyData';
import NewsTop5 from './visualizations/NewsTop5';
import Profile from './visualizations/profile';
import SearchResultsCompare from './visualizations/SearchResultsCompare';

export default function VisualizationWrapper({ name }: { name: string }) {
  const [data, setData] = useState<any>(null);

  const {
    state: { sessionId, scrapingProgress, demoMode },
  } = useScraping();

  useEffect(() => {
    const loadData = async () => {
      if (demoMode) {
        setData(demoData);
      } else if (sessionId) {
        const results = await getScrapingResultsBySession(sessionId);
        const lookups = await getLookups();
        setData({ results, lookups });
      }
    };
    loadData();
  }, [demoMode, sessionId, scrapingProgress.value, scrapingProgress.step]);

  if ((!demoMode && !sessionId) || data === null) return null;

  if (name === 'autoplaychain') {
    return <AutoplayChain data={data.results} />;
  }
  if (name === 'newstop5') {
    return <NewsTop5 data={data.results} />;
  }
  if (name === 'searchresultscompare') {
    return <SearchResultsCompare data={data.results} />;
  }
  if (name === 'profile') {
    return <Profile data={data.results} lookups={data.lookups} />;
  }
  if (name === 'data') {
    return <MyData data={data} />;
  }

  return null;
}
