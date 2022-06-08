/**
 * Add the scraping based on a global state ('isAttached').
 *
 * @module
 */
import { useScraping } from 'renderer/contexts';
import ScrapingManager from './ScrapingManager';

export default function ScapingAttached() {
  const {
    state: { isAttached, disableInput },
  } = useScraping();

  if (isAttached) return <ScrapingManager disableInput={disableInput} />;
  return null;
}
