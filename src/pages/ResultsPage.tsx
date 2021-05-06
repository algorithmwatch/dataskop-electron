import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import OverviewTable from '../components/results/OverviewTable';
import { clearData, getData, getSessionsMetaData, importRow } from '../db';
import { ScrapingResultSaved } from '../db/types';
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

  const importRowCb = async (events: any, newRowsString: string) => {
    const newRows = JSON.parse(newRowsString);
    const newRowsResults = await Promise.all(
      newRows.map(async (x: ScrapingResultSaved) => importRow(x)),
    );

    setImportedRows(
      importedRows + newRowsResults.reduce((x0, x1) => x0 + x1, 0),
    );
  };

  return (
    <Base>
      <div className="overflow-y-auto h-5/6">
        <div>{importedRows > 0 && `${importedRows} rows imported`}</div>
        <h2 className="text-xl font-bold">Results</h2>
        <div className="bg-gray-50 overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-x-4">
            <ConfirmDialog
              title="clear data"
              text="you sure?"
              handleConfirm={() => clearData() && setRows([])}
            />
            <Button onClick={async () => invokeExport(await getData())}>
              export data
            </Button>
            <Button onClick={async () => invokeImport(importRowCb)}>
              import data
            </Button>
          </div>
        </div>
        <OverviewTable rows={rows} />
      </div>
    </Base>
  );
}
