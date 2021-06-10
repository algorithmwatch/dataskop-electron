import { faNewspaper } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { groupBy } from 'lodash';
import React, { useState } from 'react';
import { ScrapingResultSaved } from '../../db/types';
import { Carousel, Slide } from '../Carousel/Carousel';
import { Options } from '../Carousel/types';
import Explainer from '../Explainer';

function Visual() {
  return (
    <div className="h-full flex bg-yellow-200 w-full max-w-3xl mx-auto p-6">
      <div className="mr-8 w-80">
        <strong>Ausgangsvideo</strong>
        <div className="w-80 h-44 mt-2 bg-gray-300" />
        <div className="mt-2 flex">
          <div className="flex items-center">
            <div className="bg-gray-300 rounded-full w-10 h-10" />
          </div>
          <div className="ml-2.5 font-bold leading-snug">
            Das ist ein langer Videotitel, hier kommt noch mehr Text
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="mr-16">
          <strong>Angemeldet</strong>
          <div className="mt-2 space-y-2">
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
          </div>
        </div>
        <div className="">
          <strong>Nicht angemeldet</strong>
          <div className="mt-2 space-y-2">
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
            <div className="w-36 h-20 bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsTop5({ data }: { data: ScrapingResultSaved }) {
  // const slugs = [
  //   'yt-playlist-page-popular',
  //   'yt-playlist-page-news-top-stories',
  // ];

  const filtered = data.filter(
    (x) => x.fields.seedCreator === 'national-news-top-stories',
  );
  const grouped = groupBy(filtered, 'fields.id');
  console.warn('data', data);
  console.warn('filtered', filtered);
  console.warn('grouped', grouped);

  const [explainerIsOpen, setExplainerIsOpen] = useState(true);
  const carouselOptions: Options = {
    focusAt: 'center',
    gap: 0,
    peek: 300,
    breakpoints: {
      1400: {
        peek: 250,
        gap: 40,
      },
      1300: {
        peek: 200,
        gap: 40,
      },
      1200: {
        peek: 175,
        gap: 40,
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
      <Carousel options={carouselOptions}>
        <Slide>
          <Visual />
        </Slide>
        <Slide>
          <Visual />
        </Slide>
        <Slide>
          <Visual />
        </Slide>
      </Carousel>
    </>
  );
}
