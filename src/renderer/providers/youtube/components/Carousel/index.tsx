import {
  faChevronCircleLeft,
  faChevronCircleRight,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Glide from "@glidejs/glide";
import classNames from "classnames";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const ArrowButton = ({
  icon,
  dir,
}: {
  icon: IconDefinition;
  dir: "<" | ">";
}) => {
  return (
    <button
      type="button"
      className={classNames({
        glide__arrow: true,
        "absolute flex top-2/4 z-10 opacity-100 cursor-pointer transition-shadow -translate-y-1/2 focus:outline-none active:outline-none select-none bg-white rounded-full":
          true,
        "left-8": dir === "<",
        "right-8": dir === ">",
        "focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50": true,
      })}
      data-glide-dir={dir}
    >
      <FontAwesomeIcon icon={icon} className="text-4xl text-blue-500" />
    </button>
  );
};

export const Carousel = forwardRef(
  (
    {
      options,
      children,
    }: {
      options: any;
      children: React.ReactNode;
    },
    ref,
  ) => {
    const sliderRef = useRef();

    useImperativeHandle(ref, () => sliderRef.current);

    useEffect(() => {
      const slider = new Glide(sliderRef.current, options);

      slider.mount();

      return () => slider.destroy();
    }, [options]);

    return (
      <div className="glide h-full" ref={sliderRef}>
        <div className="glide__track h-full" data-glide-el="track">
          <ul className="glide__slides h-full">{children}</ul>
        </div>
        <div className="glide__arrows" data-glide-el="controls">
          <ArrowButton icon={faChevronCircleLeft} dir="<" />
          <ArrowButton icon={faChevronCircleRight} dir=">" />
        </div>
        <div className="hidden lg:block absolute right-0 inset-y-0 w-20 bg-gradient-to-r from-transparent to-yellow-100" />
        <div className="hidden lg:block absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-yellow-100 to-transparent" />
      </div>
    );
  },
);
Carousel.displayName = "Carousel";

export const Slide = forwardRef(
  ({ children }: { children: React.ReactNode }, ref) => {
    return (
      <li className="glide__slide" ref={ref}>
        {children}
      </li>
    );
  },
);
Slide.displayName = "Slide";
