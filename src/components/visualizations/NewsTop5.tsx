import React from 'react';
import { Carousel, Slide } from '../Carousel/Carousel';
import { Options } from '../Carousel/types';

function Visual() {
  return (
    <div className="flex-grow h-full flex bg-yellow-200 w-full max-w-3xl mx-auto">
      <div className="w-60">Ausgangsvideo</div>
      <div className="w-32">Angemeldet</div>
      <div className="w-32">Nicht angemeldet</div>
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
