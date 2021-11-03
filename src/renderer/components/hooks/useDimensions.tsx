// @ts-nocheck

// from https://github.com/Swizec/useDimensions
import { useCallback, useLayoutEffect, useState } from 'react';

interface DimensionObject {
  width: number;
  height: number;
  top: number;
  left: number;
  x: number;
  y: number;
  right: number;
  bottom: number;
}

type UseDimensionsHook = [
  (node: HTMLElement) => void,
  {} | DimensionObject,
  HTMLElement,
];

interface UseDimensionsArgs {
  liveMeasure?: boolean;
}

function getDimensionObject(node: HTMLElement): DimensionObject {
  const rect = node.getBoundingClientRect();

  return {
    width: parseInt(rect.width),
    height: parseInt(rect.height),
    top: parseInt('x' in rect ? rect.x : rect.top),
    left: parseInt('y' in rect ? rect.y : rect.left),
    x: parseInt('x' in rect ? rect.x : rect.left),
    y: parseInt('y' in rect ? rect.y : rect.top),
    right: parseInt(rect.right),
    bottom: parseInt(rect.bottom),
  };
}

function useDimensions({
  liveMeasure = true,
}: UseDimensionsArgs = {}): UseDimensionsHook {
  const [dimensions, setDimensions] = useState({});
  const [node, setNode] = useState(null);

  const ref = useCallback((node) => {
    setNode(node);
  }, []);

  useLayoutEffect(() => {
    if (node) {
      const measure = () =>
        window.requestAnimationFrame(() =>
          setDimensions(getDimensionObject(node)),
        );
      measure();

      if (liveMeasure) {
        window.addEventListener('resize', measure);
        // window.addEventListener('scroll', measure);

        return () => {
          window.removeEventListener('resize', measure);
          // window.removeEventListener('scroll', measure);
        };
      }
    }
  }, [node]);

  return [ref, dimensions, node];
}

export default useDimensions;
