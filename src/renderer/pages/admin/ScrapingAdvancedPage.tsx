/* eslint-disable no-restricted-syntax */
import { Card } from '@material-ui/core';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../../components/Button';
import { makeGetHtml } from '../../components/scraping/ipc';
import LocalScrapinogConfigSelect from '../../components/scraping/LocalScrapingConfigSelect';
import RemoteScrapingConfig from '../../components/scraping/RemoteScrapingConfigSelect';
import ScrapingControls from '../../components/scraping/ScrapingControls';
import { useScraping } from '../../contexts/scraping';
import { Campaign } from '../../providers/types';
import {
  activateWatchHistory,
  deactivateWatchHistory,
} from '../../providers/youtube/lib/actions/manage-watch-history';
import routes from '../../routes';

export default function AdvancedScrapingPage(): JSX.Element {
  const {
    state: { sessionId, campaign },
    dispatch,
  } = useScraping();

  const history = useHistory();

  const setCampaign = (campaign: Campaign) =>
    dispatch({ type: 'set-campaign', campaign });

  // enable and disable scraping window
  useEffect(() => {
    dispatch({ type: 'set-is-attached', isAttached: true });
    return () => dispatch({ type: 'set-is-attached', isAttached: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="overflow-y-auto">
        <div>title: {campaign && campaign.title}</div>
        <div>slug: {campaign && campaign.slug}</div>
        <div>campaign: {campaign && JSON.stringify(campaign)}</div>

        <LocalScrapinogConfigSelect
          campaign={campaign}
          setCampaign={setCampaign}
        />
        <div className="mt-10">
          <Card>
            <RemoteScrapingConfig />
          </Card>
        </div>

        <ScrapingControls />
        {sessionId !== null && (
          <Button
            onClick={() =>
              history.push(
                routes.ADMIN_RESULTS_DETAILS.path.replace(
                  ':sessionId',
                  sessionId,
                ),
              )
            }
          >
            go to result
          </Button>
        )}
        <Button onClick={() => activateWatchHistory(makeGetHtml(false))}>
          activate watch history
        </Button>
        <Button onClick={() => deactivateWatchHistory(makeGetHtml(false))}>
          deactivate watch history
        </Button>
      </div>
    </>
  );
}
