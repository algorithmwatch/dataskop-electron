import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import { useEffect, useState } from "react";
import { getActiveCampaigns } from "renderer/lib/networking";
import { useConfig, useScraping } from "../../contexts";

export default function RemoteCampaignConfig() {
  const {
    state: { platformUrl, seriousProtection },
  } = useConfig();

  const { dispatch } = useScraping();

  const [camOptions, setCamOptions] = useState([]);
  const [chosenCam, setChosenCam] = useState();

  const setScrapingConfig = (remoteCampaign: any) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { scraping_config, id, title, description, slug } = remoteCampaign;
    dispatch({
      type: "set-campaign",
      campaign: { id, title, slug, description, config: scraping_config },
    });
  };

  const fetchCams = async () => {
    if (platformUrl == null) return;
    const options = await getActiveCampaigns(platformUrl, seriousProtection);
    setCamOptions(options);
  };

  useEffect(() => {
    fetchCams();
  }, [platformUrl, seriousProtection]);

  const handleChange = (event: any) => {
    setChosenCam(event.target.value);
    setScrapingConfig(event.target.value);
  };

  return (
    <div className="flex items-center justify-center">
      <FormControl>
        <InputLabel id="rsc-select-label">Wähle aus (Remote Config)</InputLabel>
        <Select
          labelId="rsc-select-label"
          value={(chosenCam != null && chosenCam) || ""}
          onChange={handleChange}
        >
          {camOptions != null
            ? camOptions.map((x: any) => (
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
