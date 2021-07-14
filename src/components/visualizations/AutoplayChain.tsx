/* eslint-disable react/no-array-index-key */
import { RecommendedVideo, VideoPage } from '@algorithmwatch/harke';
import { faPlayCircle } from '@fortawesome/pro-light-svg-icons';
import {
  faImages,
  faLongArrowDown,
  faLongArrowRight,
  faSpinnerThird,
  faUserHeadset,
  IconDefinition
} from '@fortawesome/pro-regular-svg-icons';
import { faAngleDown, faChevronRight } from '@fortawesome/pro-solid-svg-icons';
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
    { label: 'Kanäle', icon: faUserHeadset },
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
  // console.warn(currentGroup);

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
          <h1 className="hl-4xl my-6">AutoPlay</h1>
          <div className="space-y-4">
            <p>
              In der folgenden Visualisierungen kannst du oben aus sechs Videos
              auswählen. Das sind zum einen bekannte und bedeutende Videos aus
              den letzten Jahren. Zum anderen Videos, die aktuell viel
              Aufmerksamkeit erfahren. Für jedes dieser Videos zeigen wir in der
              ersten Spalte das ursprüngliche Video plus die sieben Videos, die
              YouTube dir automatisch gezeigt hätte (Autoplay-Feature), wenn du
              die Plattform einfach laufen lassen würdest. Für jedes dieser
              automatisch abgespielten Videos zeigen wir in der dazugehörigen
              Zeile die ersten zehn von YouTube empfohlenen Videos.
            </p>
            <p>
              Wenn du deinen Mauszeiger über eines der Videos bewegst, siehst du
              sowohl den Titel des Videos als auch, ob es unter den 60
              empfohlenen Videos noch ein oder mehrere Male auftaucht. Mit den
              Filtern oben rechts kannst du die Ansicht umstellten: Statt der
              Titelbilder der Videos kannst du dir die Kanalnamen anzeigen
              lassen.
            </p>
            <p className="py-4">
              <img src={explainerImage} alt="" />
            </p>
            <div>
              <Infobox>
                <p>
                  Wir erhoffen uns, durch dieses Experiment Muster erkennen zu
                  können, wie YouTube dir Videos in Abhängigkeit von deinem
                  Verlauf und den Kanälen, denen du folgst, empfiehlt. Je mehr
                  Leute ihre Daten spenden, um so besser können wir viele
                  Ergebnisse miteinander vergleichen und Rückschlüsse ziehen.
                </p>
              </Infobox>
            </div>
          </div>
        </div>
      </Explainer>
      <div className="mx-auto space-y-6">
        {/* Seed videos menu */}
        {seedVideos.length > 0 && (
          <div className="flex justify-between">
            <div className="flex flex-col">
              <div className="font-bold mb-1">Ausgangsvideos</div>
              <div className="flex  h-20">
                <SeedVideoMenu
                  seedVideos={seedVideos}
                  currentVideoIndex={currentSeedVideoIndex}
                  onSelect={(index) => setCurrentSeedVideoIndex(index)}
                  // displaySpinner={isScrapingStarted && !isScrapingPaused}
                  // - you can't get on the page if not all are loaded
                  // - scraping may still be running (for search etc.)
                  displaySpinner={false}
                />
              </div>
            </div>
            <div className="flex flex-col ml-4">
              <div className="font-bold mb-1">Filter</div>
              <div className="flex h-20">
                <ViewSwitcher
                  modeIndex={modeIndex}
                  onModeIndexChange={(index: number) => setModeIndex(index)}
                />
              </div>
            </div>
          </div>
        )}

        {currentGroup.length > 0 && (
          <>
            {/* Viz */}
            <div className="flex max-w-6xl">
              {/* Column 1: Autoplay videos */}
              <div className="space-y-2 mr-6">
                <div className="flex text-sm whitespace-nowrap">
                  <div className="mr-1">
                    <FontAwesomeIcon icon={faLongArrowDown} size="1x" />
                  </div>
                  <div>Autoplay</div>
                </div>
                {currentGroup.map((scrapeResult, index) => (
                  <div
                    key={`autoplay-${scrapeResult.fields.id}-${index}`}
                    className="relative"
                  >
                    {index > 0 ? (
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
                        className={classNames({
                          'opacity-40':
                            hoveringVideoId &&
                            hoveringVideoId !== scrapeResult.fields.id,
                        })}
                      />
                    ) : (
                      <div className="w-24 h-14 bg-yellow-600 flex items-center justify-center text-sm">
                        Ausgangs-
                        <br />
                        video
                      </div>
                    )}

                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="absolute -right-4 top-5 text-yellow-1500"
                    />
                  </div>
                ))}
              </div>

              {/* Column 2: Recommended videos of autoplayed videos */}
              <div className="space-y-2 overflow-hidden">
                <div className="flex text-sm whitespace-nowrap">
                  <div>Empfohlene Videos</div>
                  <div className="ml-1">
                    <FontAwesomeIcon icon={faLongArrowRight} size="1x" />
                  </div>
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
                            creatorName={video.channelName}
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
