import { RecommendedVideo } from '@algorithmwatch/harke';
import { faSearch } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import React, { useState } from 'react';
import { ScrapingResultSaved } from '../../db/types';
import Explainer from '../Explainer';
import Thumbnail from '../Thumbnail';

interface SearchResultsCompareDataItem {
  query: string;
  signedInVideos: RecommendedVideo[];
  signedOutVideos: RecommendedVideo[];
}

export default function AutoplayChain({
  data,
}: {
  data: ScrapingResultSaved[];
}) {
  const [explainerIsOpen, setExplainerIsOpen] = useState(true);
  const groups = _(data)
    .filter(
      (y) =>
        y.success === true &&
        ['yt-video-page-seed-follow', 'yt-video-page-followed'].includes(
          y.slug,
        ),
    )
    .groupBy('fields.followId')
    .values()
    .value();
  const seedVideos = groups.map((group) => group[0].fields);
  const [currentSeedVideoIndex, setCurrentSeedVideoIndex] = useState(0);
  const currentGroup = groups[currentSeedVideoIndex] || [];

  console.warn('groups', groups);
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
        <div className="flex space-x-2">
          {seedVideos.map((video) => (
            <Thumbnail key={video.id} videoId={video.id} />
          ))}
        </div>

        {/* Viz */}
        <div className="flex max-w-6xl">
          {/* Column 1: Autoplay videos */}
          <div className="space-y-2">
            <div className="text-sm whitespace-nowrap">Autoplay Videos</div>
            {currentGroup.length &&
              currentGroup.map((scrapeResult) => (
                <Thumbnail
                  key={scrapeResult.fields.id}
                  videoId={scrapeResult.fields.id}
                />
              ))}
          </div>

          {/* Column 2: Recommended videos of autoplayed videos */}
          <div className="space-y-2 overflow-hidden">
            <div className="text-sm whitespace-nowrap">Empfohlene Videos</div>
            {currentGroup.length &&
              currentGroup.map((scrapeResult) => (
                <div key={scrapeResult.fields.id} className="flex">
                  {scrapeResult.fields.recommendedVideos.map(
                    (video: RecommendedVideo) => (
                      <Thumbnail key={video.id} videoId={video.id} />
                    ),
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
