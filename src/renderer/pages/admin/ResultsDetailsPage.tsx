import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import ResultsDetails from '../../components/results/ResultDetails';
import { useScraping } from '../../contexts';
import { getLookups, getScrapingResultsBySession } from '../../db';
import { filterLookupBySession } from '../../providers/youtube/lib/utils';
import routes from '../../routes';

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
            history.push(
              routes.VISUALIZATION_ADVANCED.path.replace(
                ':sessionId',
                sessionId,
              ),
            )
          }
        >
          Show profile visualizations
        </Button>
        <Button
          onClick={() =>
            history.push(routes.VISUALIZATION_EXPERIMENT.path, {
              sessionId,
              type: 'newstop5',
            })
          }
        >
          News Top-5
        </Button>
        <Button
          onClick={() =>
            history.push(routes.VISUALIZATION_EXPERIMENT.path, {
              sessionId,
              type: 'search-results-compare',
            })
          }
        >
          Search Results Compare
        </Button>
        <Button
          onClick={() =>
            history.push(routes.VISUALIZATION_EXPERIMENT.path, {
              sessionId,
              type: 'autoplay-chain',
            })
          }
        >
          Autplay Chain
        </Button>
      </div>
      <ResultsDetails sessionId={sessionId} />
    </>
  );
}
