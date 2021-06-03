import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import OverviewTable from '../components/results/OverviewTable';
import { clearData, getScrapingResults, getSessions, importRow } from '../db';
import { ScrapingResultSaved } from '../db/types';
import { getVideos } from '../providers/youtube/utils';

const invokeExport = async (data: ScrapingResultSaved[]) => {
  const filename = `dataskop-${dayjs().format('YYYY-MM-DD-HH-mm-s')}.json`;
  ipcRenderer.invoke('results-export', JSON.stringify(data), filename);
};

const invokeImageExport = async (data: ScrapingResultSaved[]) => {
  const filename = `dataskop-images-${dayjs().format('YYYY-MM-DD-HH-mm-s')}`;
  const ytIds = getVideos(data)
    .map((x: ScrapingResultSaved) => {
      return x.fields.recommendedVideos.map(({ id }) => id);
    })
    .flat();
  ipcRenderer.invoke('results-export-images', uniq(ytIds), filename);
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
      setRows(await getSessions());
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
    <>
      <div className="overflow-y-auto h-5/6">
        <div>{importedRows > 0 && `${importedRows} rows imported`}</div>
        <h2 className="text-xl font-bold">Results</h2>
        <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6 space-x-4">
          <ConfirmDialog
            title="clear data"
            text="you sure?"
            handleConfirm={() => clearData() && setRows([])}
          />
          <Button
            onClick={async () => invokeExport(await getScrapingResults())}
          >
            export data
          </Button>
          <Button onClick={async () => invokeImport(importRowCb)}>
            import data
          </Button>
          <Button
            onClick={async () => invokeImageExport(await getScrapingResults())}
          >
            export thumbnails
          </Button>
        </div>
        <OverviewTable rows={rows} />
      </div>
    </>
  );
}
