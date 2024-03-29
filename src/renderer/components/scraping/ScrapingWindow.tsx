/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 * The actual window (tab) where the scraping is happening.
 *
 * @module
 */
import { faCog, faTimes } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { pick, round } from "lodash";
import { useEffect } from "react";
import { Rnd } from "react-rnd";
import { Bounds, useConfig, useScraping } from "renderer/contexts";

const ScrapingWindow = ({ forceReload = 0 }: { forceReload: number }) => {
  const margin = 30;

  const initSizeFactorHeight = 0.8;
  const initSizeFactorWidth = 0.8;

  const {
    state: {
      isMuted,
      fixedWindow,
      bounds,
      visibleWindow,
      closeableWindow,
      initPositionWindow,
    },
    dispatch,
  } = useScraping();

  const {
    state: { userConfig },
  } = useConfig();

  const setBounds = (newBounds: Bounds) => {
    dispatch({ type: "set-bounds", bounds: newBounds });
  };

  useEffect(() => {
    window.electron.ipc.invoke("scraping-set-muted", isMuted);
  }, [isMuted]);

  const windowDimensions = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const leftOverSpace = 1 - initSizeFactorHeight;
    const leftOverSpaceWidth = 1 - initSizeFactorWidth;

    const res = {
      width: round(width * initSizeFactorWidth),
      height: round(height * initSizeFactorHeight),
      x: round(width * leftOverSpaceWidth),
      y: round(height * leftOverSpace),
    };

    if (initPositionWindow === "center") {
      res.x = round(width * leftOverSpaceWidth * 0.5);
      res.y = round(height * leftOverSpace * 0.5);
    }

    if (initPositionWindow === "center-top") {
      res.x = round(width * leftOverSpaceWidth * 0.5);
      res.y = margin;
    }

    return res;
  };

  useEffect(() => {
    if (visibleWindow || (!!userConfig && userConfig.scrapingForceOpen)) {
      const b = bounds;
      b.height -= margin * 2;
      b.width -= margin * 2;
      b.x += margin;
      b.y += margin * 2;
      window.electron.ipc.invoke("scraping-set-bounds", b);
    } else {
      // const b = { ...bounds, width: 0, height: 0 };

      // Set off screen. TikTok wasn't working otherwise
      const b = { height: 1500, width: 2000, x: 0, y: window.screen.height };
      window.electron.ipc.invoke("scraping-set-bounds", b);
    }
  }, [bounds, visibleWindow]);

  useEffect(() => {
    setBounds(windowDimensions());
  }, [
    initPositionWindow,
    initSizeFactorHeight,
    forceReload,
    initSizeFactorWidth,
  ]);

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
      <div>
        <FontAwesomeIcon
          spin
          icon={faCog}
          style={{
            width: 100,
            height: 100,
            position: "fixed",
            left: bounds.x + bounds.width / 2 - 50,
            top: bounds.y + bounds.height / 2 - 50,
            color: "black",
          }}
        />
      </div>
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
};

export default ScrapingWindow;
