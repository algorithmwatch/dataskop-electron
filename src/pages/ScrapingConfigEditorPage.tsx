/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { Card, CardContent, CardHeader } from '@material-ui/core';
import React from 'react';
import { useConfig } from '../contexts/config';

export default function ScrapingConfigEditorPage(): JSX.Element {
  const {
    state: { scrapingConfig },
    dispatch,
  } = useConfig();

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
      </div>
    </>
  );
}
