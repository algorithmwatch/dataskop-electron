import React, { useState, useRef, useEffect } from 'react';

import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';

import { getData, clearData } from '../utils/db';

import Base from './Base';

import SessionTable from './SessionTable';

export default function VisualizationDetails({ sessionId }): JSX.Element {
  const [rows, setRows] = useState<any>([]);

  useEffect(() => {
    const newRows = async () => {
      setRows(await getData());
    };
    newRows();
  }, []);

  return (
    <Base>
      <h2>{sessionId}</h2>
      <SessionTable data={rows} />
    </Base>
  );
}
