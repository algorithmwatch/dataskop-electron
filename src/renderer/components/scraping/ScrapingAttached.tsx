/**
 * Add the scraping based on a global state ('isAttached').
 *
 * @module
 */
import { useEffect } from 'react';
import { useConfig, useScraping } from 'renderer/contexts';
import { currentDelay } from 'renderer/lib/delay';
import ScrapingManager from './ScrapingManager';

export default function ScrapingAttached() {
  const {
    state: {
      isAttached,
      disableInput,
      campaign,
      isScrapingStarted,
      isScrapingFinished,
    },
    dispatch,
  } = useScraping();

  const {
    state: { userConfig },
    dispatch: configDispatch,
  } = useConfig();

  // Monitoring

  // we only want to find out if it's reaady to notify the user

  useEffect(() => {
    (async () => {
      if (userConfig && userConfig.monitoring && !isScrapingStarted) {
        dispatch({ type: 'set-attached', attached: true, visible: false });
        console.log('now1');
        await currentDelay();
        console.log('now2');
        dispatch({ type: 'set-scraping-started', started: true });

        // Attach
        // Check if loggend in, then act
        // Start scraping
      }
    })();
  }, [userConfig?.monitoring, isScrapingStarted]);

  useEffect(() => {
    (async () => {
      if (userConfig && userConfig.monitoring && isScrapingFinished) {
        configDispatch({
          type: 'set-user-config',
          newValues: { monitoring: false },
        });
        dispatch({ type: 'reset-scraping' });
        dispatch({ type: 'set-attached', attached: false, visible: false });

        // Disable monitoring flag
        // Process post-monitoring result
        // Notify main about finished monitoring

        // If something went wrong, ask them to check again. If not's working to report to us.
      }
    })();
  }, [userConfig?.monitoring, isScrapingFinished]);

  // Only render scraping manger when the campaign is set to avoid tedious guard clauses.
  if (isAttached && campaign)
    return <ScrapingManager disableInput={disableInput} campaign={campaign} />;
  return null;
}
