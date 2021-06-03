import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useParams } from 'react-router-dom';
import FooterNav from '../components/FooterNav';
import SmallMultipleChart from '../components/visualizations/SmallMultipleChart';
import { useConfig } from '../contexts/config';
import { getSessionData } from '../db';
import routes from '../router/constants.json';

export default function VisualizationExperimentsPage(): JSX.Element {
  const { sessionId }: { sessionId: string } = useParams();

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
      clickHandler(history: RouteComponentProps['history']) {
        history.push(routes.DONATION);
      },
    },
  ];

  return (
    <>
      <SmallMultipleChart data={data} />
      <FooterNav items={footerNavItems} />
    </>
  );
}
