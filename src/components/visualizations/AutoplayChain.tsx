/* eslint-disable react/no-array-index-key */
import { RecommendedVideo } from '@algorithmwatch/harke';
import {
  faImages,
  faTags,
  faUserHeadset,
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

interface SearchResultsCompareDataItem {
  query: string;
  signedInVideos: RecommendedVideo[];
  signedOutVideos: RecommendedVideo[];
}

function ViewSwitcherItem({
  label,
  icon,
}: {
  label: string;
  icon: IconDefinition;
}) {
  return (
    <div className="py-0.5 flex flex-col items-center">
      <FontAwesomeIcon icon={icon} size="2x" />
      <div className="text-sm">{label}</div>
    </div>
  );
}

function ViewSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = [
    { label: 'Thumbnails', icon: faImages },
    { label: 'Kategorien', icon: faTags },
    { label: 'Creator', icon: faUserHeadset },
  ];

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="relative flex items-center py-2 px-3 border-2 border-yellow-700 bg-yellow-200 text-blue-600"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="">
        {items
          .filter((x, index) => (isOpen ? true : index === selectedIndex))
          .map(({ label, icon }, index) => (
            <ViewSwitcherItem key={label} label={label} icon={icon} />
          ))}
      </div>
      <div className="ml-3">
        <FontAwesomeIcon icon={faAngleDown} />
      </div>
    </div>
  );
}

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
  );
  const [currentSeedVideoIndex, setCurrentSeedVideoIndex] = useState(0);
  const [hoveringVideoId, setHoveringVideoId] = useState<null | string>(null);
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
  // console.warn('currentGroup', currentGroup);

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
          <div className="flex">
            <div className="flex max-w-min space-x-4 p-2 border-2 border-yellow-700 bg-yellow-200">
              {seedVideos.map(
                ({ id, title, channel, uploadDate, viewCount }, index) => (
                  <div
                    key={`seed-${id}`}
                    className={classNames({
                      'ring-8 ring-yellow-700': index === currentSeedVideoIndex,
                    })}
                  >
                    <VideoThumbnail
                      videoId={id}
                      tippyOptions={{
                        content: (
                          <TooltipContent
                            video={{
                              title,
                              channelName: channel.name,
                              uploadDate,
                              viewCount,
                            }}
                          />
                        ),
                        theme: 'process-info',
                      }}
                      className="cursor-pointer"
                      onClickCallback={() => setCurrentSeedVideoIndex(index)}
                    />
                  </div>
                ),
              )}
            </div>
            <div className="ml-4">
              <ViewSwitcher />
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
                        content: (
                          <TooltipContent
                            video={{
                              title: scrapeResult.fields.title,
                              channelName: scrapeResult.fields.channel.name,
                              uploadDate: scrapeResult.fields.uploadDate,
                              viewCount: scrapeResult.fields.viewCount,
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
                            tippyOptions={{
                              content: (
                                <TooltipContent
                                  video={{
                                    title: video.title,
                                    channelName: video.channelName,
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
