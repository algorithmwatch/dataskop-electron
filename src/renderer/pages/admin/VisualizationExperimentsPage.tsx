import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AutoplayChain from '../../components/visualizations/AutoplayChain';
import NewsTop5 from '../../components/visualizations/NewsTop5';
import SearchResultsCompare from '../../components/visualizations/SearchResultsCompare';
import { useConfig } from '../../contexts/config';
import { getScrapingResultsBySession } from '../../db';

interface LocationState {
  sessionId: string;
  type: string;
}

export default function VisualizationExperimentsPage() {
  const { state } = useLocation<LocationState>();
  const { sessionId, type } = state;

  const [data, setData] = useState<any>([]);
  const {
    state: { isDebug },
  } = useConfig();

  useEffect(() => {
    const loadData = async () => {
      setData(await getScrapingResultsBySession(sessionId));
    };
    loadData();
  }, [sessionId]);

  if (isDebug) {
    console.debug(data);
  }

  if (!sessionId || !type) return null;

  return (
    <>
      {type === 'newstop5' && <NewsTop5 data={data} />}
      {type === 'search-results-compare' && (
        <SearchResultsCompare data={data} />
      )}
      {type === 'autoplay-chain' && <AutoplayChain data={data} />}
    </>
  );
}
