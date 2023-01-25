import {
  faChevronCircleLeft,
  faChevronCircleRight,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Glide, { Options } from "@glidejs/glide";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";

// srx: https://github.com/glidejs/glide/issues/366#issuecomment-844153173

export const Carousel = forwardRef(
  (
    {
      options,
      showArrows,
      showBullets,
      children,
    }: {
      options: Options;
      showArrows?: boolean;
      showBullets?: boolean;
      children: React.ReactNode[];
    },
    ref: any,
  ) => {
    const glide = new Glide(".main__glide", options);
    useImperativeHandle(ref, () => glide);

    useEffect(() => {
      const mounted = glide.mount();
      return () => mounted.destroy();
    }, [options]);

    return (
      <div className="main__glide glide">
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides">{children}</ul>
        </div>
        {showArrows && (
          <div className="glide__arrows" data-glide-el="controls">
            <button
              type="button"
              className="glide__arrow glide__arrow--left"
              data-glide-dir="<"
            >
              <FontAwesomeIcon
                icon={faChevronCircleLeft}
                className="text-4xl text-blue-500"
              />
            </button>
            <button
              type="button"
              className="glide__arrow glide__arrow--right"
              data-glide-dir=">"
            >
              <FontAwesomeIcon
                icon={faChevronCircleRight}
                className="text-4xl text-blue-500"
              />
            </button>
          </div>
        )}
        {showBullets && (
          <div
            className="glide__bullets sm:max-lg:mb-5"
            data-glide-el="controls[nav]"
          >
            {Array.from(Array(children.length).keys()).map((index) => (
              <button
                key={index}
                type="button"
                aria-label={`Schritt ${index + 1}`}
                className="glide__bullet"
                data-glide-dir={`=${index}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

Carousel.displayName = "Carousel";

export const Slide = ({ children }: { children: React.ReactNode }) => {
  return <li className="glide__slide">{children}</li>;
};

Slide.displayName = "Slide";
