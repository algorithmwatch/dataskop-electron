import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import Base from '../layouts/Base';
import { clearData, getSessionsMetaData } from '../utils/db';

export default function ResultsPage(): JSX.Element {
  const [rows, setRows] = useState<any>([]);

  useEffect(() => {
    const newRows = async () => {
      setRows(await getSessionsMetaData());
    };
    newRows();
  }, []);

  return (
    <Base>
      <button
        className="button"
        type="button"
        onClick={() => clearData() && setRows([])}
      >
        clear data
      </button>
      <h2>Results</h2>
      {rows.map((x) => {
        return (
          <div key={x.id}>
            <Link to={routes.RESULTS_DETAILS.replace(':sessionId', x.id)}>
              {`${x.id}, ${new Date(x.scrapedAt)}, Items ${x.count}`}
            </Link>
          </div>
        );
      })}
    </Base>
  );
}
