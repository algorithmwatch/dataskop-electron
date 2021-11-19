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
import { useEffect, useState } from 'react';
import { Campaign } from 'renderer/providers/types';
import { allCampaigns } from 'renderer/providers/youtube';
import { getLocalCampaigns } from '../../lib/db';
import Button from '../Button';

const LocalScrapingConfigSelect = ({
  campaign,
  setCampaign,
}: {
  campaign: Campaign | null;
  setCampaign: any;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState<Campaign[]>(allCampaigns);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    const loadData = async () => {
      const stored = await getLocalCampaigns();
      setOptions(allCampaigns.concat(stored));
    };
    loadData();
  }, []);

  const uniqueOptions = _.uniqBy(options, 'slug');

  // hotfix for some strange behaviour for w/ config options and uniqueness
  const chosenOptionArray = uniqueOptions.filter(
    (x) => x && campaign && x.slug === campaign.slug,
  );

  let chosenOption = uniqueOptions[0];
  if (chosenOptionArray.length > 0) {
    [chosenOption] = chosenOptionArray;
  }

  return (
    <Card className="mt-10">
      <CardContent>
        <div>Choose a local Scraping Config</div>
        <FormControl>
          <InputLabel id="scraping-config-select">Scraping Config</InputLabel>
          <Select
            labelId="scraping-config-select"
            value={chosenOption}
            onChange={(event) => setCampaign(event.target.value)}
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
          {JSON.stringify(campaign)}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default LocalScrapingConfigSelect;
