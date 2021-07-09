import { Channel, RecommendedVideo } from '@algorithmwatch/harke';
import { faNewspaper } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import React, { useState } from 'react';
import { Placement } from 'tippy.js';
import { ScrapingResultSaved } from '../../db/types';
import { Carousel, Slide } from '../Carousel';
import { Options } from '../Carousel/types';
import Explainer from '../Explainer';
import Infobox from '../Infobox';
import VideoThumbnail, { TooltipContent } from '../VideoThumbnail';


interface NewsTop5DataItem {
  video: {
    id: string;
    title: string;
    channel: Channel;
  };
  signedInVideos: RecommendedVideo[];
  signedOutVideos: RecommendedVideo[];
}

function VideoList({
  items,
  tippyPlacement,
}: {
  items: RecommendedVideo[];
  tippyPlacement: Placement;
}) {
  return (
    <div className="space-y-2">
      {items.map(({ channelName, duration, id, percWatched, title }) => (
        <VideoThumbnail
          key={id}
          videoId={id}
          tippyOptions={{
            content: (
              <TooltipContent
                video={{ title, channel: { name: channelName } }}
              />
            ),
            placement: tippyPlacement,
            theme: 'process-info',
          }}
        />
      ))}
    </div>
  );
}

function Visual({ session }: { session: NewsTop5DataItem }) {
  const [displayCount, setDisplayCount] = useState(8);

  return (
    <div className="flex bg-yellow-200 border-2 border-yellow-400 w-full max-w-2xl mx-auto px-5 py-4 cursor-auto">
      <div className="mr-8 w-80 space-y-3">
        <div className="font-bold text-sm text-yellow-1500 mb-3">
          Ausgangsvideo
        </div>
        <div className="w-80 h-44 bg-gray-300 overflow-hidden flex place-items-center place-content-center">
          <img
            src={`https://img.youtube.com/vi/${session.video.id}/hqdefault.jpg`}
            alt=""
          />
        </div>
        <div className="font-bold leading-snug">{session.video.title}</div>
        <div className="flex">
          <div className="bg-gray-300 rounded-full w-10 h-10 overflow-hidden flex place-items-center place-content-center">
            <img src={session.video.channel.thumbnail} alt="" />
          </div>
          <div className="text-sm ml-2 flex items-center">
            {session.video.channel.name}
          </div>
        </div>

        <div className="mt-4 text-right">
          <input
            className="border border-yellow-1100 bg-yellow-200 rounded-none pl-2 text-sm"
            type="number"
            min="5"
            max="16"
            value={displayCount}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDisplayCount(Number(event.target.value))
            }
          />
        </div>
      </div>
      <div className="flex">
        <div className="mr-8">
          <div className="font-bold text-sm text-yellow-1500 mb-3">
            Angemeldet
          </div>
          <VideoList
            items={session.signedInVideos.slice(0, displayCount)}
            tippyPlacement="left"
          />
        </div>
        <div className="">
          <div className="font-bold text-sm text-yellow-1500 mb-3">
            Nicht angemeldet
          </div>
          <VideoList
            items={session.signedOutVideos.slice(0, displayCount)}
            tippyPlacement="right"
          />
        </div>
      </div>
    </div>
  );
}

export default function NewsTop5({ data }: { data: ScrapingResultSaved[] }) {
  const filtered = (() => {
    const signedInData = data.filter(
      (x) =>
        x?.fields.seedCreator === 'yt-playlist-page-national-news-top-stories',
    );
    const signedOutData = data.filter(
      (x) =>
        x?.fields.seedCreator ===
        'repeat: yt-playlist-page-national-news-top-stories',
    );

    return _.zip(signedOutData, signedInData);
  })();
  const transformed: NewsTop5DataItem[] = filtered
    .map((x) => ({
      video: {
        id: x[0]?.fields.id,
        title: x[0]?.fields.title,
        channel: x[0]?.fields.channel,
      },
      signedInVideos: x[0]?.fields.recommendedVideos,
      signedOutVideos: x[1]?.fields.recommendedVideos,
    }))
    .filter(
      (x) =>
        typeof x.signedInVideos !== 'undefined' &&
        typeof x.signedOutVideos !== 'undefined',
    );

  // console.warn('filtered', filtered);
  // console.warn('transformed', transformed);

  const [explainerIsOpen, setExplainerIsOpen] = useState(true);
  const carouselOptions: Options = {
    // focusAt: 'center',
    // gap: 40,
    // peek: 350,
    breakpoints: {
      2000: {
        peek: 500,
        gap: 0,
      },
      1800: {
        peek: 400,
        gap: 0,
      },
      1600: {
        peek: 350,
        gap: 40,
      },
      1500: {
        peek: 300,
        gap: 40,
      },
      1400: {
        peek: 300,
        gap: 60,
      },
      1300: {
        peek: 250,
        gap: 60,
      },
      1200: {
        peek: 200,
        gap: 60,
      },
      1100: {
        peek: 0,
        focusAt: 0,
      },
    },
  };

  return (
    <>
      <Explainer
        isOpen={explainerIsOpen}
        onIsOpenChange={(val: boolean) => setExplainerIsOpen(val)}
      >
        <FontAwesomeIcon
          icon={faNewspaper}
          size="6x"
          className="text-blue-200"
        />
        <div className="max-w-prose">
          <h1 className="hl-4xl my-6">News Viz</h1>
          <div className="space-y-4">
            <p>
              YouTube bietet auf seiner Website in einem Bereich aktuelle
              Nachrichten-Videos an. Wir haben eben dort die aktuellsten fünf
              ersten Videos ausgelesen. Wir zeigen Dir für jedes dieser
              News-Videos in der linken Spalte die ersten zehn Videos an, die Du
              empfohlen bekommst, wenn Du mit Deinem YT-Konto eingeloggt bist.
              Zum Vergleich stehen in der rechten Spalte, die Videos, die
              empfohlen werden, wenn Du nicht bei YouTube angemeldet bist.
              [Erklärung ergänzen, falls es die gleichen Filter gibt wie bei
              Autoplay Chain Viz]
            </p>
            <div>
              <Infobox classname="mt-6">
                <p>
                  Hier wollen wir untersuchen, ob die Empfehlungen bei der sich
                  schnell verändernden Nachrichtenauswahl, deutlich
                  personalisiert werden, Dabei interessiert und vor allem auch
                  die Vergleichsmöglichkeit zwischen den Empfehlungen, wenn Du
                  eingeloggt bist und wenn Du es nicht bist.
                </p>
              </Infobox>
            </div>
          </div>
        </div>
      </Explainer>
      <Carousel options={carouselOptions}>
        {transformed.length &&
          transformed.map((session) => (
            <Slide key={session.video.title}>
              <Visual session={session} />
            </Slide>
          ))}
      </Carousel>
    </>
  );
}
