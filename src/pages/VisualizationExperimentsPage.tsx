import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from 'react-router-dom';
import FooterNav from '../components/FooterNav';
import NewsTop5 from '../components/visualizations/NewsTop5';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';
import { getSessionData } from '../db';

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
      setData(await getSessionData(sessionId));
    };
    loadData();
  }, [sessionId]);

  if (isDebug) {
    console.log(data);
  }

  const footerNavItems = [
    {
      label: 'weiter zu Donation',
      classNames: 'ml-auto',
      clickHandler(history: RouteComponentProps['history']) {
        history.push(routes.DONATION);
      },
    },
  ];

  return (
    <>
      {type === 'newstop5' && <NewsTop5 data={data} />}
      <FooterNav items={footerNavItems} />
    </>
  );
}
