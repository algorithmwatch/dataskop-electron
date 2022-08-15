import { Card } from '@material-ui/core';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import LocalCampaignSelect from '../../components/admin/LocalCampaignSelect';
import RemoteCampaignSelect from '../../components/admin/RemoteCampaignSelect';
import { makeGetHtml } from '../../components/scraping/ipc';
import ScrapingControls from '../../components/scraping/ScrapingControls';
import { useScraping } from '../../contexts/scraping';
import { Campaign } from '../../providers/types';
import Button from '../../providers/youtube/components/Button';
import {
  activateWatchHistory,
  deactivateWatchHistory,
} from '../../providers/youtube/lib/actions/manage-watch-history';

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
    dispatch({ type: 'set-attached', attached: true, visible: true });
    return () =>
      dispatch({ type: 'set-attached', attached: false, visible: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="overflow-y-auto">
        <div>title: {campaign && campaign.title}</div>
        <div>slug: {campaign && campaign.slug}</div>
        <div>campaign: {campaign && JSON.stringify(campaign)}</div>

        <LocalCampaignSelect campaign={campaign} setCampaign={setCampaign} />
        <div className="mt-10">
          <Card>
            <RemoteCampaignSelect />
          </Card>
        </div>

        <ScrapingControls />
        {sessionId !== null && (
          <Button onClick={() => history.push(`/admin/results/${sessionId}`)}>
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
