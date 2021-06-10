import React from 'react';
import { useScraping } from '../../contexts/scraping';
import ScrapingManager from './ScrapingManager';

export default function ScapingAttached() {
  const {
    state: { isAttached },
  } = useScraping();

  if (isAttached) return <ScrapingManager />;
  return null;
}
