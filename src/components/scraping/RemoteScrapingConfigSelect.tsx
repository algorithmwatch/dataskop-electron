import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useConfig, useScraping } from '../../contexts';
import { getActiveCampaigns } from '../../utils/networking';

export default function RemoteScrapingConfig() {
  const {
    state: { platformUrl },
  } = useConfig();

  const { dispatch } = useScraping();

  const [camOptions, setCamOptions] = useState();
  const [chosenCam, setChosenCam] = useState();

  const setScrapingConfig = (remoteCampaign: any) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { scraping_config, id, title, description } = remoteCampaign;
    dispatch({
      type: 'set-scraping-config',
      scrapingConfig: scraping_config,
      campaign: { id, title, description },
    });
  };

  const fetchCams = async () => {
    const options = await getActiveCampaigns(platformUrl);
    setCamOptions(options);
  };

  useEffect(() => {
    fetchCams();
  }, []);

  const handleChange = (event) => {
    setChosenCam(event.target.value);
    setScrapingConfig(event.target.value);
  };

  return (
    <div className="flex items-center justify-center">
      <FormControl>
        <InputLabel id="rsc-select-label">Wähle aus (Remote Config)</InputLabel>
        <Select
          labelId="rsc-select-label"
          value={(chosenCam != null && chosenCam) || ''}
          onChange={handleChange}
        >
          {camOptions != null
            ? camOptions.map((x) => (
                <MenuItem key={x.slug} value={x}>
                  {x.title}
                </MenuItem>
              ))
            : []}
        </Select>
      </FormControl>
    </div>
  );
}
