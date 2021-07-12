/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  faList,
  faPlay,
  faSearch,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo, useRef } from 'react';
import { ScrapingResult } from '../../db/types';
export default function StatisticsChart({
  data,
}: {
  data: Array<ScrapingResult>;
}) {
  console.log(data);
  const containerRef = useRef();
  const jumpRefs = new Map([
    ['user-watch-history', useRef()],
    ['subscribed-channels', useRef()],
    ['user-search-history', useRef()],
  ]);

  const db = useMemo(() => {
    const history = data.find(
      (x) => x.success && x.slug.includes('user-watch-history'),
    )?.fields.videos;

    const channels = data.find(
      (x) => x.success && x.slug.includes('subscribed-channels'),
    )?.fields.channels;

    const queries = data.find(
      (x) => x.success && x.slug.includes('user-search-history'),
    )?.fields.queries;

    return {
      history,
      channels,
      queries,
    };
  }, [data]);
  const stringifiedData = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const stringifiedHtml = useMemo(() => {
    const lines = stringifiedData.split('\n');
    const jumpRefsKeys = [...jumpRefs.keys()];

    const html = lines.map((l, i) => {
      const field = l.split('":');
      if (field.length === 2) {
        const jumpKey = jumpRefsKeys.find((j) => l.includes(j));
        if (jumpKey) {
          console.log('jumpKey', jumpKey);
          return (
            <div key={i} ref={jumpRefs.get(jumpKey)}>
              <span className="font-bold text-blue-700">{field[0]}"</span>:
              {field[1]}
            </div>
          );
        }

        return (
          <div key={i}>
            <span className="font-bold text-blue-700">{field[0]}"</span>:
            {field[1]}
          </div>
        );
      }
      return <div key={i}>{l}</div>;
    });

    return html;
  }, [stringifiedData, jumpRefs]);

  const filesize = useMemo(() => {
    const size = new TextEncoder().encode(stringifiedData).length;
    const kiloBytes = size / 1024;
    const megaBytes = kiloBytes / 1024;
    return megaBytes.toPrecision(2);
  }, [stringifiedData]);

  const scrollTo = (jumpKey) => {
    const ref = jumpRefs.get(jumpKey);
    console.log('scrollto', jumpKey, ref?.current);
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <div
              className="p-2"
              onClick={() => scrollTo('subscribed-channels')}
            >
              <FontAwesomeIcon icon={faUser} className="mr-3" size="lg" />
              {db.channels.length} Kanäle, denen du folgst
            </div>
            <div
              className="p-2  "
              onClick={() => scrollTo('user-watch-history')}
            >
              <FontAwesomeIcon icon={faList} className="mr-3" size="lg" />
              Die letzten {db.history.length} Videos, die du gesehen hast
            </div>
            <div
              className="p-2 "
              onClick={() => scrollTo('subscribed-channels')}
            >
              <FontAwesomeIcon icon={faPlay} className="mr-3" size="lg" />
              12 Videos mit insgesamt 120 Empfehlung
            </div>
            <div
              className="p-2 "
              onClick={() => scrollTo('user-search-history')}
            >
              <FontAwesomeIcon icon={faSearch} className="mr-3" size="lg" />
              {db.queries.length} Suchbegriffe mit insg. 80 Ergebnissen
            </div>
          </div>
          <div className="mt-8">Datenmenge: {filesize} MB</div>
        </div>

        <div className="bg-gray-50 m-8 mb-0 flex relative w-7/12 flex-col p-4 border-black border-dashed border ">
          <div>JSON-Preview</div>
          <div
            className="bg-white flex-grow w-full mt-2 h-20 overflow-scroll"
            ref={containerRef}
          >
            <pre className="text-xs">{stringifiedHtml}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
