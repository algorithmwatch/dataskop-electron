import React from 'react';
import { useScraping } from '../../contexts/scraping';
import ScrapingManager from './ScrapingManager';

export default function ScapingAttached() {
  const {
    state: { isAttached, disableInput },
  } = useScraping();

  if (isAttached) return <ScrapingManager disableInput={disableInput} />;
  return null;
}
