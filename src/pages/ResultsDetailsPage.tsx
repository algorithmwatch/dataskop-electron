import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SessionTable from '../components/SessionTable';
import Stats from '../components/Stats';
import routes from '../constants/routes.json';
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
      <Link to={routes.VISUALIZATION_SESSION.replace(':sessionId', sessionId)}>
        Vis
      </Link>
      <Stats data={stats} />
      <SessionTable data={rows} />
    </Base>
  );
}

export default function ResultsDetailsPage() {
  const { sessionId } = useParams();
  return <ResultsDetails sessionId={sessionId} />;
}
