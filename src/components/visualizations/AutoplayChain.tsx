/* eslint-disable react/no-array-index-key */
import { RecommendedVideo, VideoPage } from '@algorithmwatch/harke';
import {
  faImages, faUserHeadset,
  IconDefinition
} from '@fortawesome/pro-regular-svg-icons';
import {
  faAngleDown,
  faChevronRight,
  faSearch
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import _ from 'lodash';
import debounce from 'lodash/debounce';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrapingResultSaved } from '../../db/types';
import Explainer from '../Explainer';
import VideoThumbnail, { TooltipContent } from '../VideoThumbnail';

function SeedVideoMenu({
  seedVideos,
  currentVideoIndex,
  onSelect,
}: {
  seedVideos: VideoPage[];
  currentVideoIndex: number;
  onSelect: (index: number) => void;
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
    </div>
  );
}

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
    () => groups.map((group) => group[0].fields),
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

  // Stop the invocation of the debounced function after unmounting
  useEffect(() => {
    return () => {
      setHoveringVideoIdDebounced.cancel();
    };
  }, []);

  // console.warn('seedVideos', seedVideos);
  // console.warn('groups', groups);
  console.warn('currentGroup', currentGroup);

  return (
    <>
      <Explainer
        isOpen={explainerIsOpen}
        onIsOpenChange={(val: boolean) => setExplainerIsOpen(val)}
      >
        <FontAwesomeIcon icon={faSearch} size="6x" className="text-blue-200" />
        <div className="max-w-prose">
          <h1 className="hl-4xl my-6">News Top 5</h1>
          <p className="mb-4">
            Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas
            Böses getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!«
            sagte er, es war, als sollte die Scham ihn überleben.
          </p>
          <p className="mb-4">
            Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand
            er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt.
            Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten
            Absichten, als am Ziele ihrer Fahrt die Tochter als erste sich erhob
            und ihren jungen Körper dehnte.
          </p>
          <p className="mb-4">
            »Es ist ein eigentümlicher Apparat«, sagte der Offizier zu dem
            Forschungsreisenden und überblickte mit einem gewissermaßen
            bewundernden Blick den ihm doch wohlbekannten Apparat. Sie hätten
            noch ins Boot springen können, aber der Reisende hob ein schweres,
            geknotetes Tau vom Boden, drohte ihnen damit und hielt sie dadurch
            von dem Sprunge ab.
          </p>
          <p className="mb-4">
            In den letzten Jahrzehnten ist das Interesse an Hungerkünstlern sehr
            zurückgegangen. Aber sie überwanden sich, umdrängten den Käfig und
            wollten sich gar nicht fortrühren.
          </p>
          <p className="mb-4">
            Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas
            Böses getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!«
            sagte er, es war, als sollte die Scham ihn überleben.
          </p>
          <p className="mb-4">
            Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand
            er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt.
            Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten
            Absichten, als am Ziele ihrer Fahrt die Tochter als erste sich erhob
            und ihren jungen Körper dehnte.
          </p>
          <p className="mb-4">
            »Es ist ein eigentümlicher Apparat«, sagte der Offizier zu dem
            Forschungsreisenden und überblickte mit einem gewissermaßen
            bewundernden Blick den ihm doch wohlbekannten Apparat. Sie hätten
            noch ins Boot springen können, aber der Reisende hob ein schweres,
            geknotetes Tau vom Boden, drohte ihnen damit und hielt sie dadurch
            von dem Sprunge ab.
          </p>
          <p className="mb-4">
            In den letzten Jahrzehnten ist das Interesse an Hungerkünstlern sehr
            zurückgegangen. Aber sie überwanden sich, umdrängten den Käfig und
            wollten sich gar nicht fortrühren.
          </p>
          <p className="mb-4">
            Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas
            Böses getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!«
            sagte er, es war, als sollte die Scham ihn überleben.
          </p>
          <p className="mb-4">
            Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand
            er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt.
            Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten
            Absichten, als am Ziele ihrer Fahrt die Tochter als erste sich erhob
            und ihren jungen Körper dehnte.
          </p>
          <p className="mb-4">
            »Es ist ein eigentümlicher Apparat«, sagte der Offizier zu dem
            Forschungsreisenden und überblickte mit einem gewissermaßen
            bewundernden Blick den ihm doch wohlbekannten Apparat. Sie hätten
            noch ins Boot springen können, aber der Reisende hob ein schweres,
            geknotetes Tau vom Boden, drohte ihnen damit und hielt sie dadurch
            von dem Sprunge ab.
          </p>
          <p className="mb-4">
            In den letzten Jahrzehnten ist das Interesse an Hungerkünstlern sehr
            zurückgegangen. Aber sie überwanden sich, umdrängten den Käfig und
            wollten sich gar nicht fortrühren.
          </p>
        </div>
      </Explainer>
      <div className="mx-auto space-y-6">
        {/* Seed videos menu */}
        {seedVideos.length && (
          <div className="flex h-20">
            <SeedVideoMenu
              seedVideos={seedVideos}
              currentVideoIndex={currentSeedVideoIndex}
              onSelect={(index) => setCurrentSeedVideoIndex(index)}
            />
            <div className="ml-4">
              <ViewSwitcher
                modeIndex={modeIndex}
                onModeIndexChange={(index: number) => setModeIndex(index)}
              />
            </div>
          </div>
        )}

        {currentGroup.length && (
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
                        content: <TooltipContent video={scrapeResult.fields} />,
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
                              content: <TooltipContent video={video} />,
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
