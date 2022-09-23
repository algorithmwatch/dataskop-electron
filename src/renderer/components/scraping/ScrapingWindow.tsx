/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 * The actual window (tab) where the scraping is happening.
 *
 * @module
 */
import { faTimes } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { pick, round } from "lodash";
import { useEffect } from "react";
import { Rnd } from "react-rnd";
import { Bounds, useScraping } from "renderer/contexts";

export default function ScrapingWindow({
  forceReload = 0,
  initPosition = "center",
  initSizeFactorHeight = 0.8,
  initSizeFactorWidth = 0.6,
}: {
  forceReload: number;
  initPosition?: string;
  initSizeFactorHeight?: number;
  initSizeFactorWidth?: number;
}) {
  const margin = 30;

  const {
    state: { isMuted, fixedWindow, bounds, visibleWindow, closeableWindow },
    dispatch,
  } = useScraping();

  const setBounds = (newBounds: Bounds) => {
    dispatch({ type: "set-bounds", bounds: newBounds });
  };

  useEffect(() => {
    window.electron.ipc.invoke("scraping-set-muted", isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (visibleWindow) {
      const b = { ...bounds };
      b.height -= margin * 2;
      b.width -= margin * 2;
      b.x += margin;
      b.y += margin;
      window.electron.ipc.invoke("scraping-set-bounds", b);
    } else {
      const b = { ...bounds, width: 0, height: 0 };
      window.electron.ipc.invoke("scraping-set-bounds", b);
    }
  }, [bounds, visibleWindow]);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const windowDimensions = () => {
      const leftOverSpace = 1 - initSizeFactorHeight;
      const leftOverSpaceWidth = 1 - initSizeFactorWidth;

      const res = {
        width: round(width * initSizeFactorWidth),
        height: round(height * initSizeFactorHeight),
        x: round(width * leftOverSpaceWidth),
        y: round(height * leftOverSpace),
      };

      if (initPosition === "center") {
        res.x = round(width * leftOverSpaceWidth * 0.5);
        res.y = round(height * leftOverSpace * 0.5);
      }

      return res;
    };

    setBounds(windowDimensions());
  }, [initPosition, initSizeFactorHeight, forceReload, initSizeFactorWidth]);

  if (!visibleWindow) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <Rnd
        enableResizing={!fixedWindow}
        disableDragging={fixedWindow}
        className="bg-gray-100"
        size={pick(bounds, ["width", "height"])}
        position={pick(bounds, ["x", "y"])}
        onDragStop={(_e, d) => {
          setBounds({ ...bounds, ...pick(d, ["x", "y"]) });
        }}
        onResize={(_e, _direction, ref, _delta, position) => {
          setBounds({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            ...position,
          });
        }}
      />
      {closeableWindow && (
        <div
          onClick={() => {
            dispatch({ type: "set-visible-window", visibleWindow: false });
          }}
          className="flex items-center justify-center cursor-pointer bg-gray-300 hover:bg-gray-200"
          style={{
            width: 30,
            height: 30,
            position: "fixed",
            left: bounds.x + bounds.width - 30,
            top: bounds.y,
            color: "white",
          }}
        >
          <FontAwesomeIcon
            icon={faTimes}
            className="text-yellow-1500 text-xl"
          />
        </div>
      )}
    </div>
  );
}
