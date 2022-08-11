/**
 * Add the scraping based on a global state ('isAttached').
 *
 * @module
 */
import { useScraping } from 'renderer/contexts';
import ScrapingManager from './ScrapingManager';

export default function ScrapingAttached() {
  const {
    state: { isAttached, disableInput, campaign },
  } = useScraping();

  // Only render scraping manger when the campaign is set to avoid tedious guard clauses.
  if (isAttached && campaign)
    return <ScrapingManager disableInput={disableInput} campaign={campaign} />;
  return null;
}
