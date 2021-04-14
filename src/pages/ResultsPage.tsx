import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import routes from '../constants/routes.json';
import { clearData, getData, getSessionsMetaData, importRow } from '../db';
import Base from '../layout/Base';

const invokeExport = async (data: ScrapingResultSaved[]) => {
  const filename = `dataskop-${dayjs().format('YYYY-MM-DD-HH-mm-s')}.json`;
  ipcRenderer.invoke('results-export', JSON.stringify(data), filename);
};

const invokeImport = async (loadData: Function) => {
  ipcRenderer.on('results-import-data', loadData);
  ipcRenderer.invoke('results-import');
};

export default function ResultsPage(): JSX.Element {
  const [rows, setRows] = useState<any>([]);
  const [importedRows, setImportedRows] = useState(0);

  useEffect(() => {
    const newRows = async () => {
      setRows(await getSessionsMetaData());
    };
    newRows();
  }, []);

  const importRowCb = async (events, newRowsString) => {
    const newRows = JSON.parse(newRowsString);
    const newRowsResults = await Promise.all(
      newRows.map(async (x) => importRow(x)),
    );

    setImportedRows(
      importedRows + newRowsResults.reduce((x0, x1) => x0 + x1, 0),
    );
  };

  return (
    <Base>
      <div>{importedRows > 0 && `${importedRows} rows imported`}</div>
      <ConfirmDialog
        title="clear data"
        text="you sure?"
        handleConfirm={() => clearData() && setRows([])}
      />
      <button type="button" onClick={async () => invokeExport(await getData())}>
        export data
      </button>
      <button type="button" onClick={async () => invokeImport(importRowCb)}>
        import data
      </button>
      <h2>Results</h2>
      {rows.map((x) => {
        return (
          <div key={x.id}>
            <Link
              className="underline"
              to={routes.RESULTS_DETAILS.replace(':sessionId', x.id)}
            >
              {`${x.id}, ${new Date(x.scrapedAt)}, Items ${x.count}`}
            </Link>
          </div>
        );
      })}
    </Base>
  );
}
