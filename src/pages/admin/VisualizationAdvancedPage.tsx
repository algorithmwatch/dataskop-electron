import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Profile from '../../components/visualizations/profile';
import RecommenderMap from '../../components/visualizations/RecommenderMap';
import SmallMultipleChart from '../../components/visualizations/SmallMultipleChart';
import StatisticsChart from '../../components/visualizations/StatisticsChart';
import { useConfig } from '../../contexts/config';
import { getScrapingResultsBySession } from '../../db';

export default function VisualizationAdvancedPage() {
  const [data, setData] = useState<any>([]);
  const { sessionId } = useParams();
  const {
    state: { isDebug },
  } = useConfig();

  const visCompOptions = [
    'small-multiple',
    'profile',
    'statistics',
    'recommender-map',
    'news-top5',
  ];
  const [visComp, setVisComp] = useState(visCompOptions[0]);

  const history = useHistory();

  useEffect(() => {
    const loadData = async () => {
      setData(await getScrapingResultsBySession(sessionId));
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
        {visComp === 'small-multiple' && <SmallMultipleChart data={data} />}
        {visComp === 'statistics' && <StatisticsChart data={data} />}
        {visComp === 'recommender-map' && <RecommenderMap data={data} />}
        {visComp === 'profile' && <Profile data={data} />}
      </div>
    </>
  );
}
