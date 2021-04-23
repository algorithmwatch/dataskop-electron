import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SmallMultipleChart from '../components/visualizations/SmallMultipleChart';
import routes from '../constants/routes.json';
import { useConfig } from '../contexts/config';
import { getSessionData } from '../db';
import SlideBase from '../layout/SlideBase';

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

  const footerNav = [
    {
      label: 'weiter zu Donation',
      clickHandler: (x) => x.push(routes.DONATION),
    },
  ];

  return (
    <SlideBase footerNav={footerNav}>
      <SmallMultipleChart data={data} />
    </SlideBase>
  );
}
