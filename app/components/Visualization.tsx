import React, { useState, useRef, useEffect } from 'react';

import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';

import { getData } from '../utils/db';

import Base from './Base';

export default function Visualization(): JSX.Element {
  const [rows, setRows] = useState<any>([]);

  useEffect(() => {
    const newRows = async () => {
      setRows(await getData());
      // const daRows = await getData();
      // setRows(daRows);
    };
    newRows();
  }, []);

  return (
    <Base>
      <h2>Visualization</h2>
      {rows.map((x) => {
        return <div key={x.id}>{JSON.stringify(x)}</div>;
      })}
    </Base>
  );
}
