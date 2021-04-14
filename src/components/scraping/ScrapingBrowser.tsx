import { ipcRenderer } from 'electron';
import { round } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

const setMutedStatus = async (isMuted: boolean) => {
  return ipcRenderer.invoke('scraping-set-muted', isMuted);
};

export default function ScrapingBrowser({ isMuted }) {
  const [bounds, setBounds] = useState({
    x: 500,
    y: 200,
    width: 300,
    height: 300,
  });
  const margin = 30;

  useEffect(() => {
    setMutedStatus(isMuted);
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
    setBounds({
      width: round(width / 3),
      height: round((2 * height) / 3),
      x: round((2 * width) / 3),
      y: round(height / 3),
    });
  }, []);

  return (
    <div style={{ position: 'fixed', left: 0, top: 0 }}>
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
