import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ResultsDetails from '../../components/admin/results/ResultDetails';
import { useScraping } from '../../contexts';
import { getLookups, getScrapingResultsBySession } from '../../lib/db';
import Button from '../../providers/youtube/components/Button';
import { filterLookupBySession } from '../../providers/youtube/lib/utils';

export default function ResultsDetailsPage() {
  const { sessionId }: { sessionId: string } = useParams();
  const history = useHistory();
  const { dispatch } = useScraping();

  const invokeExport = async () => {
    const filename = `dataskop-${sessionId}-${dayjs().format(
      'YYYY-MM-DD-HH-mm-s',
    )}.json`;
    const results = await getScrapingResultsBySession(sessionId);
    const lookups = filterLookupBySession(results, await getLookups());
    window.electron.ipcRenderer.invoke(
      'results-export',
      JSON.stringify({ results, lookups }),
      filename,
    );
  };

  useEffect(() => {
    dispatch({ type: 'set-session-id', sessionId });
  }, [sessionId]);

  return (
    <>
      <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6 space-x-4">
        <Button onClick={() => history.goBack()}>Go back</Button>
        <Button onClick={invokeExport}>Export session</Button>

        <Button
          onClick={() =>
            history.push(`/admin/visualization/advanced/${sessionId}`)
          }
        >
          Show visualizations
        </Button>
      </div>
      <ResultsDetails sessionId={sessionId} />
    </>
  );
}
