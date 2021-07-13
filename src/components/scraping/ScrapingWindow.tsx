/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react-hooks/exhaustive-deps */
import { ipcRenderer } from 'electron';
import { pick, round } from 'lodash';
import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useScraping } from '../../contexts';

export default function ScrapingWindow({
  forceReload = 0,
  initPosition = 'center',
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
    state: { isMuted, fixedWindow, bounds, visibleWindow },
    dispatch,
  } = useScraping();

  const setBounds = (bounds) => {
    dispatch({ type: 'set-bounds', bounds });
  };

  useEffect(() => {
    ipcRenderer.invoke('scraping-set-muted', isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (visibleWindow) {
      const b = { ...bounds };
      b.height -= margin * 2;
      b.width -= margin * 2;
      b.x += margin;
      b.y += margin;
      ipcRenderer.invoke('scraping-set-bounds', b);
    } else {
      const b = { ...bounds, width: 0, height: 0 };
      ipcRenderer.invoke('scraping-set-bounds', b);
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

      if (initPosition === 'center') {
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
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <Rnd
        enableResizing={!fixedWindow}
        disableDragging={fixedWindow}
        className="bg-gray-100"
        size={pick(bounds, ['width', 'height'])}
        position={pick(bounds, ['x', 'y'])}
        onDragStop={(_e, d) => {
          setBounds({ ...bounds, ...pick(d, ['x', 'y']) });
        }}
        onResize={(_e, _direction, ref, _delta, position) => {
          setBounds({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            ...position,
          });
        }}
      />
      <div
        onClick={() => {
          dispatch({ type: 'set-visible-window', visibleWindow: false });
        }}
        className="bg-gray-500 text-center"
        style={{
          width: 30,
          height: 30,
          position: 'fixed',
          left: bounds.x + bounds.width - 30,
          top: bounds.y,
          color: 'white',
        }}
      >
        X
      </div>
    </div>
  );
}
