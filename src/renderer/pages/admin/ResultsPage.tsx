import dayjs from 'dayjs';
import { uniq } from 'lodash';
import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import OverviewTable from '../../components/results/OverviewTable';
import {
  clearData,
  clearLookups,
  getAllData,
  getScrapingResults,
  getSessions,
  importResultRows,
  importSessionRows,
} from '../../db';
import { ScrapingResultSaved } from '../../db/types';
import { getVideos } from '../../providers/youtube/lib/utils';

const invokeExport = async () => {
  const filename = `dataskop-${dayjs().format('YYYY-MM-DD-HH-mm-s')}.json`;
  const data = await getAllData();
  window.electron.ipcRenderer.invoke(
    'results-export',
    JSON.stringify(data),
    filename,
  );
};

const invokeImageExport = async (data: ScrapingResultSaved[]) => {
  const filename = `dataskop-images-${dayjs().format('YYYY-MM-DD-HH-mm-s')}`;
  const ytIds = getVideos(data)
    .map((x: ScrapingResultSaved) => {
      return x.fields.recommendedVideos.map(({ id }: { id: any }) => id);
    })
    .flat();
  window.electron.ipcRenderer.invoke(
    'results-export-images',
    uniq(ytIds),
    filename,
  );
};

const invokeImport = async (loadData: {
  (events: any, newRowsString: string): Promise<void>;
  (event: Electron.IpcRendererEvent, ...args: any[]): void;
}) => {
  window.electron.ipcRenderer.on('results-import-data', loadData);
  window.electron.ipcRenderer.invoke('results-import');
};

export default function ResultsPage(): JSX.Element {
  const [rows, setRows] = useState<any>([]);
  const [importedRows, setImportedRows] = useState(0);

  useEffect(() => {
    const newRows = async () => {
      setRows(await getSessions());
    };
    newRows();
  }, [importedRows]);

  const importRowCb = async (_events: any, newRowsString: string) => {
    const { scrapingResults, scrapingSessions } = JSON.parse(newRowsString);
    const numImportedRows = await importResultRows(scrapingResults);
    await importSessionRows(scrapingSessions);

    setImportedRows(numImportedRows);
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
            handleConfirm={() => {
              clearData();
              setRows([]);
            }}
          />
          <ConfirmDialog
            title="clear lookup table"
            text="you sure?"
            handleConfirm={clearLookups}
          />
          <Button onClick={async () => invokeExport()}>export data</Button>
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
