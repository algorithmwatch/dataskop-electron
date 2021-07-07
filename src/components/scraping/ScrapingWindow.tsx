import { ipcRenderer } from 'electron';
import { pick, round } from 'lodash';
import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useScraping } from '../../contexts';

export default function ScrapingWindow({
  forceReload = 0,
  initPosition = 'center',
  initSizeFactor = 0.6,
}: {
  forceReload: number;
  initPosition?: string;
  initSizeFactor?: number;
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
      const leftOverSpace = 1 - initSizeFactor;

      const res = {
        width: round(width * initSizeFactor),
        height: round(height * initSizeFactor),
        x: round(width * leftOverSpace),
        y: round(height * leftOverSpace),
      };

      if (initPosition === 'center') {
        res.x = round(width * leftOverSpace * 0.5);
        res.y = round(height * leftOverSpace * 0.5);
      }

      return res;
    };

    setBounds(windowDimensions());
  }, [initPosition, initSizeFactor, forceReload]);

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
    </div>
  );
}
