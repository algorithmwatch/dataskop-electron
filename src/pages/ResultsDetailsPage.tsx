import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SessionTable from '../components/SessionTable';
import Stats from '../components/Stats';
import { getSessionData, getStatisticsForSession } from '../db';
import Base from '../layouts/Base';

function ResultsDetails({ sessionId }): JSX.Element {
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
      <Stats data={stats} />
      <SessionTable data={rows} />
    </Base>
  );
}

export default function ResultsDetailsPage() {
  const { sessionId } = useParams();
  return <ResultsDetails sessionId={sessionId} />;
}
