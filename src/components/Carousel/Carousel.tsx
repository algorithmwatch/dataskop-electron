import {
  faChevronCircleLeft,
  faChevronCircleRight,
  IconDefinition,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Glide from '@glidejs/glide';
import classNames from 'classnames';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Options } from './types';

const ArrowButton = ({
  icon,
  dir,
}: {
  icon: IconDefinition;
  dir: '<' | '>';
}) => {
  const classes = classNames({
    glide__arrow: true,
    'glide__arrow--left': dir === '<',
    'glide__arrow--right': dir === '>',
    'absolute block top-2/4 z-10 opacity-100 cursor-pointer transition-all -translate-y-1/2 focus:outline-none': true,
    'left-8': dir === '<',
    'right-8': dir === '>',
  });

  return (
    <button type="button" className={classes} data-glide-dir={dir}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};

export const Carousel = forwardRef(
  (
    {
      options,
      children,
    }: {
      options: Options;
      children: React.ReactNode;
    },
    ref,
  ) => {
    const sliderRef = useRef();

    useImperativeHandle(ref, () => sliderRef.current);
    console.warn('options', options);
    useEffect(() => {
      const slider = new Glide(sliderRef.current, options);

      slider.mount();

      return () => slider.destroy();
    }, [options]);

    return (
      <div className="glide" ref={sliderRef}>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides">{children}</ul>
        </div>
        <div className="glide__arrows" data-glide-el="controls">
          <ArrowButton icon={faChevronCircleLeft} dir="<" />
          <ArrowButton icon={faChevronCircleRight} dir=">" />
        </div>
      </div>
    );
  },
);
Carousel.displayName = 'Carousel';

export const Slide = forwardRef(
  ({ children }: { children: React.ReactNode }, ref) => {
    return (
      <li className="glide__slide" ref={ref}>
        {children}
      </li>
    );
  },
);
Slide.displayName = 'Slide';
