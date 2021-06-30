import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';
import FooterNav from '../../components/FooterNav';
import AutoplayChain from '../../components/visualizations/AutoplayChain';
import NewsTop5 from '../../components/visualizations/NewsTop5';
import SearchResultsCompare from '../../components/visualizations/SearchResultsCompare';
import routes from '../../constants/routes.json';
import { useConfig } from '../../contexts/config';
import { getScrapingResultsBySession } from '../../db';

interface LocationState {
  sessionId: string;
  type: string;
}

export default function VisualizationExperimentsPage() {
  const { state } = useLocation<LocationState>();
  const { sessionId, type } = state;

  if (!sessionId || !type) return null;

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

  const footerNavItems = [
    {
      label: 'weiter zu Donation',
      classNames: 'ml-auto',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(routes.DONATION1);
      },
    },
  ];

  return (
    <>
      {type === 'newstop5' && <NewsTop5 data={data} />}
      {type === 'search-results-compare' && (
        <SearchResultsCompare data={data} />
      )}
      {type === 'autoplay-chain' && <AutoplayChain data={data} />}
      <FooterNav items={footerNavItems} />
    </>
  );
}
