import React, { useState, useRef, useEffect } from 'react';

import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';

// TODO: link to details page

import { clearData, getSessionMetaData } from '../utils/db';

import Base from './Base';

export default function Visualization(): JSX.Element {
  const [rows, setRows] = useState<any>([]);

  useEffect(() => {
    const newRows = async () => {
      setRows(await getSessionMetaData());
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
      <h2>Visualization</h2>
      {rows.map((x) => {
        return (
          <div key={x.id}>
            <Link to={routes.VISUALIZATION_DETAILS.replace(':sessionId', x.id)}>
              {`${x.id} ${x.scrapedAt} ${x.count}`}
            </Link>
          </div>
        );
      })}
    </Base>
  );
}
