import React, { useEffect, useState } from 'react';
import { getSessionData, getStatisticsForSession } from '../../db';
import Base from '../../layout/Base';
import DetailsTable from './DetailsTable';
import Stats from './Stats';

export default function ResultsDetails({
  sessionId,
}: {
  sessionId: string;
}): JSX.Element {
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
      <div className="overflow-y-auto" style={{ height: '90vh' }}>
        <h2>Session: {sessionId}</h2>
        <Stats data={stats} />
        <DetailsTable rows={rows} />
      </div>
    </Base>
  );
}
