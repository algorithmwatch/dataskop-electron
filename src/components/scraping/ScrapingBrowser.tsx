import { ipcRenderer } from 'electron';
import { round } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

// TODO: add invisible div to prevent interaction

export default function ScrapingBrowser({
  isMuted = true,
  isInteractive = true,
  initPosition = 'center',
  initSizeFactor = 0.6,
}: {
  isMuted: boolean;
  isInteractive: boolean;
  initPosition: string;
  initSizeFactor: number;
}) {
  const margin = 30;
  const [bounds, setBounds] = useState({
    width: margin * 2,
    height: margin * 2,
    x: margin * 2,
    y: margin * 2,
  });

  useEffect(() => {
    ipcRenderer.invoke('scraping-set-muted', isMuted);
  }, [isMuted]);

  useEffect(() => {
    const b = { ...bounds };
    b.height -= margin * 2;
    b.width -= margin * 2;
    b.x += margin;
    b.y += margin;

    ipcRenderer.invoke('scraping-set-bounds', b);
  }, [bounds]);

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
  }, [initPosition, initSizeFactor]);

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <Rnd
        className="bg-gray-100"
        size={{ width: bounds.width, height: bounds.height }}
        position={{ x: bounds.x, y: bounds.y }}
        onDragStop={(e, d) => {
          setBounds({ ...bounds, x: d.x, y: d.y });
        }}
        onResize={(e, direction, ref, delta, position) => {
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
