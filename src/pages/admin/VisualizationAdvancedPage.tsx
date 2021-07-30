import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import MyData from '../../components/visualizations/MyData';
import Profile from '../../components/visualizations/profile';
import { useConfig } from '../../contexts/config';
import { getLookups, getScrapingResultsBySession } from '../../db';

export default function VisualizationAdvancedPage() {
  const [data, setData] = useState<any>(null);
  const { sessionId } = useParams();
  const {
    state: { isDebug },
  } = useConfig();

  const visCompOptions = ['profile', 'mydata'];
  const [visComp, setVisComp] = useState(visCompOptions[0]);

  const history = useHistory();

  useEffect(() => {
    const loadData = async () => {
      const results = await getScrapingResultsBySession(sessionId);
      const lookups = await getLookups();
      setData({ results, lookups });
    };
    loadData();
  }, [sessionId]);

  if (isDebug) {
    console.log(data);
  }

  const handleChange = (event) => {
    setVisComp(event.target.value);
  };

  return (
    <>
      <div className="space-x-4 mb-10 px-6">
        <Button onClick={() => history.goBack()}>Go back</Button>
        <FormControl>
          <InputLabel id="demo-simple-select-label">Visualization</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={visComp}
            onChange={handleChange}
          >
            {visCompOptions.map((x) => (
              <MenuItem key={x} value={x}>
                {x}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="overflow-y-auto h-full">
        {visComp === 'profile' && data && (
          <Profile data={data.results} lookups={data.lookups} />
        )}
        {visComp === 'mydata' && data && <MyData data={data} />}
      </div>
    </>
  );
}
