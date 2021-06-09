/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import {
  Card,
  CardActions,
  CardContent,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { makeGetHtml } from '../components/scraping/ipc';
import ScrapingControls from '../components/scraping/ScrapingControls';
import routes from '../constants/routes.json';
import { useScraping } from '../contexts/scraping';
import { allConfigs } from '../providers/youtube';
import {
  activateWatchHistory,
  deactivateWatchHistory,
} from '../providers/youtube/actions';

const ScrapingConfigSelect = ({ scrapingConfig, setScrapingConfig }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const configOptions = allConfigs;

  return (
    <Card className="mt-10">
      <CardContent>
        <div>Choose a Scraping Config</div>
        <FormControl>
          <InputLabel id="scraping-config-select">Scraping Config</InputLabel>
          <Select
            labelId="scraping-config-select"
            value={scrapingConfig}
            onChange={(event) => setScrapingConfig(event.target.value)}
          >
            {configOptions.map((x) => (
              <MenuItem key={x.title} value={x}>
                {x.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
      <CardActions disableSpacing>
        <Button
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          {expanded ? 'hide JSON' : 'show JSON'}
        </Button>
      </CardActions>
      <Collapse in={expanded} timeout={1000}>
        <CardContent className="break-words">
          {JSON.stringify(scrapingConfig)}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default function AdvancedScrapingPage(): JSX.Element {
  const {
    state: { scrapingConfig, sessionId },
    dispatch,
  } = useScraping();

  const setScrapingConfig = (scrapingConfig) =>
    dispatch({ type: 'set-scraping-config', scrapingConfig });

  useEffect(() => {
    dispatch({ type: 'set-is-attached', isAttached: true });
    return () => dispatch({ type: 'set-is-attached', isAttached: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="overflow-y-auto">
        <ScrapingConfigSelect
          scrapingConfig={scrapingConfig}
          setScrapingConfig={setScrapingConfig}
        />
        <ScrapingControls />
        {sessionId !== null && (
          <Link to={routes.RESULTS_DETAILS.replace(':sessionId', sessionId)}>
            go to result
          </Link>
        )}
        <Button onClick={(x) => activateWatchHistory(makeGetHtml(false))}>
          activate watch history
        </Button>
        <Button onClick={(x) => deactivateWatchHistory(makeGetHtml(false))}>
          deactivate watch history
        </Button>
      </div>
    </>
  );
}
