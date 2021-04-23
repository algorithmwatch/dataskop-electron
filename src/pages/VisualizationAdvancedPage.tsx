import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SmallMultipleChart from '../components/visualizations/SmallMultipleChart';
import { useConfig } from '../contexts/config';
import { getSessionData } from '../db';
import Base from '../layout/Base';

export default function VisualizationAdvancedPage() {
  const [data, setData] = useState<any>([]);
  const { sessionId } = useParams();
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

  return (
    <Base>
      <SmallMultipleChart data={data} />
    </Base>
  );
}
