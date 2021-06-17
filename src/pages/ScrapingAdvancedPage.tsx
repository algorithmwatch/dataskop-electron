/* eslint-disable no-restricted-syntax */
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
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../components/Button';
import { makeGetHtml } from '../components/scraping/ipc';
import ScrapingControls from '../components/scraping/ScrapingControls';
import routes from '../constants/routes.json';
import { useScraping } from '../contexts/scraping';
import { getStoredScrapingConfigs } from '../db';
import { ScrapingConfig } from '../providers/types';
import { allConfigs } from '../providers/youtube';
import {
  activateWatchHistory,
  deactivateWatchHistory,
} from '../providers/youtube/actions/manage-watch-history';

const ScrapingConfigSelect = ({
  scrapingConfig,
  setScrapingConfig,
}: {
  scrapingConfig: ScrapingConfig;
  setScrapingConfig: any;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [configOptions, setOptions] = useState(allConfigs as ScrapingConfig[]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    const loadData = async () => {
      const stored = await getStoredScrapingConfigs();
      setOptions((allConfigs as ScrapingConfig[]).concat(stored));
    };
    loadData();
  }, []);

  const uniqueOptions = _.uniqBy(configOptions, 'slug');

  // hotfix for some strange behaviour for w/ config options and uniqueness
  const chosenOptionArray = uniqueOptions.filter(
    (x) => x.slug === scrapingConfig.slug,
  );

  let chosenOption = uniqueOptions[0];
  if (chosenOptionArray.length > 0) {
    [chosenOption] = chosenOptionArray;
  } else {
    // happens if the selected scraping config is deleted, choose a default one
    setScrapingConfig(chosenOption);
  }

  return (
    <Card className="mt-10">
      <CardContent>
        <div>Choose a Scraping Config</div>
        <FormControl>
          <InputLabel id="scraping-config-select">Scraping Config</InputLabel>
          <Select
            labelId="scraping-config-select"
            value={chosenOption}
            onChange={(event) => setScrapingConfig(event.target.value)}
          >
            {uniqueOptions.map((x) => (
              <MenuItem key={x.slug} value={x}>
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
    state: { scrapingConfig: curScrapingConfig, sessionId },
    dispatch,
  } = useScraping();

  const history = useHistory();

  const setScrapingConfig = (scrapingConfig: ScrapingConfig) =>
    dispatch({ type: 'set-scraping-config', scrapingConfig });

  // enable and disable scraping window
  useEffect(() => {
    dispatch({ type: 'set-is-attached', isAttached: true });
    return () => dispatch({ type: 'set-is-attached', isAttached: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="overflow-y-auto">
        <ScrapingConfigSelect
          scrapingConfig={curScrapingConfig}
          setScrapingConfig={setScrapingConfig}
        />
        <ScrapingControls />
        {sessionId !== null && (
          <Button
            onClick={() =>
              history.push(
                routes.RESULTS_DETAILS.replace(':sessionId', sessionId),
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
