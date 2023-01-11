/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import React, { useState } from "react";

const Explainer = ({
  isOpen = false,
  onIsOpenChange,
  children,
}: {
  isOpen?: boolean;
  onIsOpenChange: (value: boolean) => void;
  children: React.ReactNode;
}): JSX.Element | null => {
  const [isToggleHover, setIsToggleHover] = useState(false);

  return (
    <div
      className={clsx({
        "absolute inset-0 z-50 overflow-y-scroll bg-yellow-1400/50": isOpen,
      })}
    >
      <div
        className={clsx(
          "w-[48rem] min-h-full inset-y-0 bg-white z-30 transition-all duration-300 ease-in-out flex flex-col justify-between box-content border-r-8",
          {
            "-left-[48rem] absolute": !isOpen,
            "left-0 relative": isOpen,
            "border-yellow-600": !isToggleHover,
            "border-yellow-800": isToggleHover,
          },
        )}
      >
        {/* Open/close toggle */}
        <div
          className={clsx("absolute top-20", {
            "right-4": isOpen,
            "-right-2": !isOpen,
          })}
        >
          <button
            type="button"
            onClick={() => onIsOpenChange(!isOpen)}
            onMouseOver={() => setIsToggleHover(true)}
            onMouseOut={() => setIsToggleHover(false)}
            className={clsx(
              "w-10 h-10 fixed focus:outline-none transition-colors duration-300 ease-in-out",
              {
                "bg-yellow-600": !isToggleHover,
                "bg-yellow-800": isToggleHover,
              },
            )}
          >
            <FontAwesomeIcon
              icon={isOpen ? faChevronLeft : faChevronRight}
              className="text-yellow-1500"
              size="lg"
            />
          </button>
        </div>

        {/* Content */}
        <div className="px-12 py-16">{children}</div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          tabIndex={-1}
          className="fixed inset-0 h-full z-10"
          onClick={() => onIsOpenChange(false)}
        />
      )}
    </div>
  );
};

export default Explainer;
