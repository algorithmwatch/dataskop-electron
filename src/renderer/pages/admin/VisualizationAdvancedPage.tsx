import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import AutoplayChain from 'renderer/providers/youtube/components/visualizations/AutoplayChain';
import NewsTop5 from 'renderer/providers/youtube/components/visualizations/NewsTop5';
import SearchResultsCompare from 'renderer/providers/youtube/components/visualizations/SearchResultsCompare';
import { useConfig } from '../../contexts/config';
import { getLookups, getScrapingResultsBySession } from '../../lib/db';
import Button from '../../providers/youtube/components/Button';
import MyData from '../../providers/youtube/components/visualizations/MyData';
import Profile from '../../providers/youtube/components/visualizations/profile';

export default function VisualizationAdvancedPage() {
  const [data, setData] = useState<any>(null);
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    state: { isDebug },
  } = useConfig();

  const visCompOptions = [
    'profile',
    'mydata',
    'newstop5',
    'search-results-compare',
    'autoplay-chain',
  ];
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

  const handleChange = (event: any) => {
    setVisComp(event.target.value);
  };

  return (
    <>
      <div className="space-x-4 mb-10 px-6">
        <Button onClick={() => history.goBack()}>Go back</Button>
        <FormControl>
          <InputLabel id="vis-select-label">Visualization</InputLabel>
          <Select
            labelId="vis-select-label"
            id="vis-select"
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
        {visComp === 'newstop5' && <NewsTop5 data={data.results} />}
        {visComp === 'search-results-compare' && (
          <SearchResultsCompare data={data.results} />
        )}
        {visComp === 'autoplay-chain' && <AutoplayChain data={data.results} />}
      </div>
    </>
  );
}
