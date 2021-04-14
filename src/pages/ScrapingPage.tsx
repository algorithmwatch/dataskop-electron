/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import React, { useState } from 'react';
import Scraping from '../components/scraping/Scraping';
import Base from '../layout/Base';
import { allConfigs as ytConfigs } from '../providers/youtube';

// the actual scraping window

export default function ScrapingPage(): JSX.Element {
  const [scrapingConfig, setScrapingConfig] = useState<any>(ytConfigs[1]);

  return (
    <Base>
      <h2 className="title is-2">Scraping</h2>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam fugit
        laboriosam suscipit fuga omnis error asperiores minus! In, ratione
        perferendis sequi libero laborum esse soluta, ut rerum placeat
        consectetur deleniti.
      </p>
      <p>enter youtube ids here</p>
      <textarea
        style={{ width: '500px' }}
        rows={10}
        value={
          typeof scrapingConfig.procedureConfig.seedFixedVideos === 'string'
            ? scrapingConfig.procedureConfig.seedFixedVideos
            : scrapingConfig.procedureConfig.seedFixedVideos.join(' ')
        }
        onChange={(e) => {
          try {
            if (e.target.value == null) return;
            setScrapingConfig({
              ...scrapingConfig,
              procedureConfig: {
                ...scrapingConfig.procedureConfig,
                seedFixedVideos: e.target.value,
              },
            });
          } catch (error) {
            console.error(error);
          }
        }}
      />
      <p>how many to videos to follow auto-play</p>
      <input
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
      <hr />

      <div className="dropdown is-hoverable is-up">
        <div className="dropdown-trigger">
          <button
            type="button"
            className="button"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
          >
            <span>{scrapingConfig.title}</span>
            <span className="icon is-small">
              <i className="fas fa-angle-up" aria-hidden="true" />
            </span>
          </button>
        </div>
        <div className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            {ytConfigs.map((x) => (
              <button
                key={x.title}
                className="dropdown-item"
                type="button"
                onClick={() => setScrapingConfig(x)}
              >
                {x.title}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Scraping scrapingConfig={scrapingConfig} />
    </Base>
  );
}
