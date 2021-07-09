/* eslint-disable react/no-array-index-key */
import { RecommendedVideo, VideoPage } from '@algorithmwatch/harke';
import { faPlayCircle } from '@fortawesome/pro-light-svg-icons';
import {
  faImages,
  faSpinnerThird,
  faUserHeadset,
  IconDefinition
} from '@fortawesome/pro-regular-svg-icons';
import {
  faAngleDown,
  faChevronRight
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import _ from 'lodash';
import debounce from 'lodash/debounce';
import React, { useMemo, useState } from 'react';
import { useScraping } from '../../contexts';
import { ScrapingResultSaved } from '../../db/types';
import explainerImage from '../../static/images/autoplay-explainer.png';
import Explainer from '../Explainer';
import Infobox from '../Infobox';
import VideoThumbnail, { TooltipContent } from '../VideoThumbnail';

const SeedVideoMenu = React.memo(function SeedVideoMenu({
  seedVideos,
  currentVideoIndex,
  onSelect,
  displaySpinner,
}: {
  seedVideos: VideoPage[];
  currentVideoIndex: number;
  onSelect: (index: number) => void;
  displaySpinner?: boolean;
}) {
  return (
    <div className="flex items-center max-w-min border-2 border-yellow-700 bg-yellow-200">
      {seedVideos.map((video: VideoPage, index: number) => (
        <div
          key={`seed-${video.id}`}
          className={classNames('p-2 h-full flex items-center', {
            'bg-yellow-700': index === currentVideoIndex,
          })}
        >
          <VideoThumbnail
            videoId={video.id}
            tippyOptions={{
              content: <TooltipContent video={video} />,
              theme: 'process-info',
            }}
            className="cursor-pointer"
            onClickCallback={() => onSelect(index)}
          />
        </div>
      ))}

      {displaySpinner && (
        <div className="pl-2 pr-3 h-full flex items-center text-yellow-800">
          <FontAwesomeIcon icon={faSpinnerThird} spin size="3x" />
        </div>
      )}
    </div>
  );
});

function ViewSwitcherItem({
  label,
  icon,
  menuIsOpen = false,
  isSelected,
  onSelect,
}: {
  label: string;
  icon: IconDefinition;
  menuIsOpen?: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      key={label}
      className={classNames(
        'w-full h-20 flex flex-col items-center justify-center hover:bg-yellow-400 transition-all',
        {
          'bg-yellow-200': !menuIsOpen,
          'bg-yellow-300': menuIsOpen,
        },
      )}
      onClick={onSelect}
    >
      <FontAwesomeIcon icon={icon} size="2x" />
      <div
        className={classNames('text-sm select-none', {
          underline: isSelected,
        })}
      >
        {label}
      </div>
    </div>
  );
}

const ViewSwitcher = React.memo(function ViewSwitcher({
  modeIndex,
  onModeIndexChange,
}: {
  modeIndex: number;
  onModeIndexChange: (index: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    { label: 'Thumbnails', icon: faImages },
    // { label: 'Kategorien', icon: faTags },
    { label: 'Creator', icon: faUserHeadset },
  ];
  const selectedItem = items[modeIndex];

  return (
    <div className="relative w-28 h-full flex items-center border-2 border-yellow-700 bg-yellow-200 text-blue-600 cursor-pointer z-10">
      <div className="ml-auto mr-3 z-20 pointer-events-none">
        <FontAwesomeIcon icon={faAngleDown} />
      </div>
      <div
        className={classNames('absolute inset-0', {
          'overflow-hidden': !isOpen,
          'h-max ring ring-yellow-700': isOpen,
        })}
      >
        <ViewSwitcherItem
          key={selectedItem.label}
          label={selectedItem.label}
          icon={selectedItem.icon}
          menuIsOpen={isOpen}
          isSelected
          onSelect={() => setIsOpen(!isOpen)}
        />
        {isOpen &&
          items.map(({ label, icon }, index) => {
            const isSelected = index === modeIndex;
            return (
              !isSelected && (
                <ViewSwitcherItem
                  key={label}
                  label={label}
                  icon={icon}
                  isSelected={isSelected}
                  onSelect={() => {
                    onModeIndexChange(index);
                    setIsOpen(false);
                  }}
                />
              )
            );
          })}
      </div>
    </div>
  );
});

export default function AutoplayChain({
  data,
}: {
  data: ScrapingResultSaved[];
}) {
  const {
    state: { isScrapingStarted, isScrapingPaused },
  } = useScraping();
  const [explainerIsOpen, setExplainerIsOpen] = useState(true);
  const groups = useMemo(
    () =>
      _(data)
        .filter(
          (y) =>
            y.success === true &&
            ['yt-video-page-seed-follow', 'yt-video-page-followed'].includes(
              y.slug,
            ),
        )
        .groupBy('fields.followId')
        .values()
        .value(),
    [data],
  );
  const seedVideos = useMemo(
    () =>
      groups
        .map((group) => group[0].fields)
        .filter((x) => x.seedCreator === 'fixed'),
    [groups],
  ) as VideoPage[];
  const [currentSeedVideoIndex, setCurrentSeedVideoIndex] = useState(0);
  const [hoveringVideoId, setHoveringVideoId] = useState<null | string>(null);
  const [modeIndex, setModeIndex] = useState<0 | 1>(0);
  const setHoveringVideoIdDebounced = useMemo(
    () => debounce(setHoveringVideoId, 50),
    [],
  );
  const currentGroup = groups[currentSeedVideoIndex] || [];
  const recommendedVideosLimit = 10;

  // console.warn('seedVideos', seedVideos);
  // console.warn('groups', groups);
  // console.warn('currentGroup', currentGroup);

  return (
    <>
      <Explainer
        isOpen={explainerIsOpen}
        onIsOpenChange={(val: boolean) => setExplainerIsOpen(val)}
      >
        <FontAwesomeIcon
          icon={faPlayCircle}
          size="6x"
          className="text-blue-200"
        />
        <div className="max-w-prose">
          <h1 className="hl-4xl my-6">AutoPlay Chain Viz</h1>
          <div className="space-y-4">
            <p>
              In der folgenden Visualisierungen kannst Du du oben aus acht
              Videos auswählen. Das sind zum einen bekannte und bedeutende
              Videos aus den letzten Jahren. Zum anderen Videos, die dieser Tage
              aktuell viel Aufmerksamkeit erfahren.  Für jedes dieser Videos
              zeigen wir in der ersten Spalte das ursprüngliche Video plus die
              sieben Videos. Es sind die, die YouTube Dir automatisch gezeigt
              hätte (autoplay), wenn Du YouTube einfach laufen lassen würdest.
              Für jedes dieser automatisch  abgespielten Videos zeigen wir in
              der dazugehörigen Spalte die ersten zehn von YouTube empfohlenen
              Videos (recommendations).
            </p>
            <p>
              Wenn Du Deinen Mauszeiger über eines der Videos bewegst, siehst
              Du, sowohl den Titel usw. des Videos, aber auch, ob es unter den
              80 empfohlenen Videos noch ein- oder mehre Male auftaucht. Mit den
              Filtern oben rechts kannst Du die Ansicht umstellten: Statt der
              Titelbilder der Videos kannst Du etwa die Kategorien der
              empfohlenen Videos sehen oder wie alt sie sind.
            </p>
            <p className="py-4">
              <img src={explainerImage} alt="" />
            </p>
            <div>
              <Infobox>
                <p>
                  Wir erhoffen uns, durch dieses Experiment Muster erkennen zu
                  können, die Rückschlüsse erlauben, inwiefern YouTube Dir
                  Videos abhängig von Deiner Watch-History und welchen Kanälen
                  Du folgst, empfiehlt. Dafür hilft es, wenn viele Leute ihre
                  Daten spenden, weil wir dann viele Ergebnisse miteinander
                  vergleichen können.
                </p>
              </Infobox>
            </div>
          </div>
        </div>
      </Explainer>
      <div className="mx-auto space-y-6">
        {/* Seed videos menu */}
        {seedVideos.length > 0 && (
          <div className="flex h-20">
            <SeedVideoMenu
              seedVideos={seedVideos}
              currentVideoIndex={currentSeedVideoIndex}
              onSelect={(index) => setCurrentSeedVideoIndex(index)}
              displaySpinner={isScrapingStarted && !isScrapingPaused}
            />
            <div className="ml-4">
              <ViewSwitcher
                modeIndex={modeIndex}
                onModeIndexChange={(index: number) => setModeIndex(index)}
              />
            </div>
          </div>
        )}

        {currentGroup.length > 0 && (
          <>
            {/* Viz */}
            <div className="flex max-w-6xl">
              {/* Column 1: Autoplay videos */}
              <div className="space-y-2 mr-6">
                <div className="text-sm whitespace-nowrap mb-3">
                  Autoplay Videos
                </div>
                {currentGroup.map((scrapeResult, index) => (
                  <div
                    key={`autoplay-${scrapeResult.fields.id}-${index}`}
                    className="relative"
                  >
                    <VideoThumbnail
                      videoId={scrapeResult.fields.id}
                      tippyOptions={{
                        content: (
                          <TooltipContent
                            video={{
                              title: scrapeResult.fields.title,
                              channel: scrapeResult.fields.channel,
                              uploadDate: scrapeResult.fields.uploadDate,
                              viewCount: scrapeResult.fields.viewCount,
                              upvotes: scrapeResult.fields.upvotes,
                              downvotes: scrapeResult.fields.downvotes,
                            }}
                          />
                        ),
                        theme: 'process-info',
                      }}
                      onMouseOverCallback={() =>
                        setHoveringVideoIdDebounced(scrapeResult.fields.id)
                      }
                      onMouseOutCallback={() =>
                        setHoveringVideoIdDebounced(null)
                      }
                      className={
                        hoveringVideoId &&
                        hoveringVideoId !== scrapeResult.fields.id
                          ? 'opacity-40'
                          : undefined
                      }
                    />
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="absolute -right-3 top-5 text-yellow-1500"
                    />
                  </div>
                ))}
              </div>

              {/* Column 2: Recommended videos of autoplayed videos */}
              <div className="space-y-2 overflow-hidden">
                <div className="text-sm whitespace-nowrap mb-3">
                  Empfohlene Videos
                </div>
                {currentGroup
                  .slice(0, recommendedVideosLimit)
                  .map((scrapeResult, index) => (
                    <div
                      key={`${scrapeResult.fields.id}-${index}`}
                      className="flex space-x-2"
                    >
                      {scrapeResult.fields.recommendedVideos.map(
                        (video: RecommendedVideo, index2: number) => (
                          <VideoThumbnail
                            key={`${video.id}-${index}-${index2}`}
                            videoId={video.id}
                            type={modeIndex}
                            tippyOptions={{
                              content: (
                                <TooltipContent
                                  video={{
                                    title: video.title,
                                    channel: {
                                      name: video.channelName,
                                    },
                                  }}
                                />
                              ),
                              theme: 'process-info',
                            }}
                            onMouseOverCallback={() =>
                              setHoveringVideoIdDebounced(video.id)
                            }
                            onMouseOutCallback={() =>
                              setHoveringVideoIdDebounced(null)
                            }
                            className={
                              hoveringVideoId && hoveringVideoId !== video.id
                                ? 'opacity-40'
                                : undefined
                            }
                          />
                        ),
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
