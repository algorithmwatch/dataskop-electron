import React, { useEffect, useState } from 'react';
// import styles from './Home.css';
import { getSessionData, getStatisticsForSession } from '../utils/db';
import Base from './Base';
import SessionTable from './SessionTable';

export default function VisualizationDetails({ sessionId }): JSX.Element {
  const [rows, setRows] = useState<any>([]);
  const [stats, setStats] = useState<any>([]);

  useEffect(() => {
    const newRows = async () => {
      setRows(await getSessionData(sessionId));
      setStats(await getStatisticsForSession(sessionId));
    };
    newRows();
  }, []);

  return (
    <Base>
      <h2>{sessionId}</h2>
      {JSON.stringify(stats)}
      <SessionTable data={rows} />
    </Base>
  );
}
