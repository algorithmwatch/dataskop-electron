// @ts-nocheck

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  faList,
  faPlay,
  faSearch,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useMeasure } from 'react-use';
import { FixedSizeList as List } from 'react-window';
import Button from '../Button';

const invokeExport = async (data: any) => {
  const filename = `dataskop-${dayjs().format('YYYY-MM-DD-HH-mm-s')}.json`;
  window.electron.ipc.invoke('results-export', JSON.stringify(data), filename);
};

const Row = ({ index, style, data }: any) => {
  const item = data[index];
  return <pre style={style}>{item}</pre>;
};

export default function MyData({ data }: any) {
  const [containerRef, containerDimensions] = useMeasure();
  const listRef = React.createRef();

  const db = useMemo(() => {
    const history = data.results.find(
      (x: any) => x.success && x.slug.includes('user-watch-history'),
    )?.fields.videos;

    const scrapes = data.results.filter(
      (x: any) => x.success && x.slug.includes('video-page-seed-follow'),
    );

    const scrapesResultsNum = scrapes.reduce((acc: any, curr: any) => {
      return acc + curr.fields?.recommendedVideos.length || 0;
    }, 0);

    const channels = data.results.find(
      (x: any) => x.success && x.slug.includes('subscribed-channels'),
    )?.fields.channels;

    const queries = data.results.find(
      (x: any) => x.success && x.slug.includes('search-results-videos'),
    )?.fields.videos;

    return {
      history,
      scrapes,
      channels,
      scrapesResultsNum,
      queries,
    };
  }, [data]);

  const stringifiedData = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const stringifiedDataSplit = useMemo(
    () => stringifiedData.split('\n'),
    [stringifiedData],
  );

  const filesize = useMemo(() => {
    const size = new TextEncoder().encode(stringifiedData).length;
    const kiloBytes = size / 1024;
    const megaBytes = kiloBytes / 1024;
    return megaBytes.toPrecision(2);
  }, [stringifiedData]);

  // const scrollTo = (jumpKey) => {
  //   const index = stringifiedDataSplit.findIndex((l) => l.includes(jumpKey));
  //   if (!index) return;
  //   const line = stringifiedDataSplit[index];
  //   // console.log('scrollto', jumpKey, index, line);
  //   listRef.current.scrollToItem(index, 'start');
  // };

  return (
    <div className="cursor-default self-center h-full w-full">
      <div className="flex flex-row  h-full">
        <div className="m-8 w-5/12">
          <div className="hl-2xl mb-4">
            Diese Daten wurden von dir gesammelt
          </div>
          <div className="mb-4">
            Du siehst hier exakt die Daten in dem Format, wie du sie gleich
            spenden kannst.
          </div>
          <div className="divide-y-2 divide-yellow-600 divide-dashed cursor-pointer">
            {db.channels && db.channels.length > 0 && (
              <div
                className="p-2"
                // onClick={() => scrollTo('subscribed-channels')}
              >
                <FontAwesomeIcon icon={faUser} className="mr-3" size="lg" />
                {db.channels.length} Kanäle, denen du folgst
              </div>
            )}
            {db.history && db.history.length > 0 && (
              <div
                className="p-2  "
                // onClick={() => scrollTo('user-watch-history')}
              >
                <FontAwesomeIcon icon={faList} className="mr-3" size="lg" />
                Die letzten {db.history.length} Videos, die du gesehen hast
              </div>
            )}
            {db.scrapes && db.scrapes.length > 0 && (
              <div
                className="p-2 "
                // onClick={() => scrollTo('video-page-seed-follow')}
              >
                <FontAwesomeIcon icon={faPlay} className="mr-3" size="lg" />
                {db.scrapes.length} Videos mit insgesamt {db.scrapesResultsNum}{' '}
                Empfehlung
              </div>
            )}
            {db.queries && db.queries.length > 0 && (
              <div
                className="p-2 "
                // onClick={() => scrollTo('search-results-videos')}
              >
                <FontAwesomeIcon icon={faSearch} className="mr-3" size="lg" />
                {db.queries.length} Suchbegriffe
              </div>
            )}
          </div>
          <div className="mt-9">
            <Button onClick={async () => invokeExport(data)}>
              Daten speichern ({filesize} MB)
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 m-8 mb-0 flex relative w-7/12 flex-col p-4 border-black border-dashed border ">
          <div>JSON-Preview</div>

          <div
            className="bg-white flex-grow w-full mt-2 h-20 text-xs"
            ref={containerRef}
          >
            {containerDimensions?.width && (
              <List
                itemData={stringifiedDataSplit}
                width={containerDimensions.width}
                height={containerDimensions.height}
                itemCount={stringifiedDataSplit.length}
                itemSize={20}
                ref={listRef}
              >
                {Row}
              </List>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
