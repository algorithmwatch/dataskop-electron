/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { makeGetHtml } from '../components/scraping/controls';
import Scraping from '../components/scraping/Scraping';
import { useConfig } from '../contexts/config';
import { allConfigs } from '../providers/youtube';
import {
  activateWatchHistory,
  deactivateWatchHistory,
} from '../providers/youtube/actions';
import routes from '../router/constants.json';

const ScrapingConfigSelect = ({ scrapingConfig, setScrapingConfig }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="mt-10">
      <CardContent>
        <div>Choose a Base for Scraping Config</div>
        <FormControl>
          <InputLabel id="scraping-config-select">Scraping Config</InputLabel>
          <Select
            labelId="scraping-config-select"
            value={scrapingConfig}
            onChange={(event) => setScrapingConfig(event.target.value)}
          >
            {allConfigs.map((x) => (
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
    state: { scrapingConfig },
    dispatch,
  } = useConfig();

  const [sessionId, setSessionId] = useState(null);

  const setScrapingConfig = (scrapingConfig) =>
    dispatch({ type: 'set-scraping-config', scrapingConfig });

  return (
    <>
      <div className="overflow-y-auto">
        <Card>
          <CardHeader title="Scraping Advanced Configuration" />
          <CardContent>
            <p>
              This is an advancaded configuration tool for the scraping. This
              tool is not used for the end user of DataSkop.
            </p>
          </CardContent>
          <CardContent>
            <p>enter youtube ids here</p>
            <textarea
              className="bg-gray-200"
              style={{ width: '500px' }}
              rows={10}
              value={
                typeof scrapingConfig.procedureConfig.seedVideosFixed ===
                'string'
                  ? scrapingConfig.procedureConfig.seedVideosFixed
                  : scrapingConfig.procedureConfig.seedVideosFixed.join(' ')
              }
              onChange={(e) => {
                try {
                  if (e.target.value == null) return;
                  setScrapingConfig({
                    ...scrapingConfig,
                    procedureConfig: {
                      ...scrapingConfig.procedureConfig,
                      seedVideosFixed: e.target.value,
                    },
                  });
                } catch (error) {
                  console.error(error);
                }
              }}
            />
            <p>how many to videos to follow auto-play</p>
            <input
              className="bg-gray-200"
              id="number"
              type="number"
              step="1"
              value={scrapingConfig.procedureConfig.followVideos}
              onChange={(e) => {
                setScrapingConfig({
                  ...scrapingConfig,
                  procedureConfig: {
                    ...scrapingConfig.procedureConfig,
                    followVideos: parseInt(e.target.value, 10),
                  },
                });
              }}
            />
          </CardContent>
        </Card>

        <ScrapingConfigSelect
          scrapingConfig={scrapingConfig}
          setScrapingConfig={setScrapingConfig}
        />
        <Scraping
          scrapingConfig={scrapingConfig}
          onDone={(x) => setSessionId(x)}
        />
        {sessionId !== null && (
          <Link to={routes.RESULTS_DETAILS.replace(':sessionId', sessionId)}>
            go to result
          </Link>
        )}
        <Button onClick={(x) => activateWatchHistory(makeGetHtml(false))}>
          Activate Watch History
        </Button>
        <Button onClick={(x) => deactivateWatchHistory(makeGetHtml(false))}>
          Deactivate Watch History
        </Button>
      </div>
    </>
  );
}
