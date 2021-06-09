import React from 'react';
import { Carousel, Slide } from '../Carousel/Carousel';
import { Options } from '../Carousel/types';

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

export default function NewsTop5() {
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
  );
}
