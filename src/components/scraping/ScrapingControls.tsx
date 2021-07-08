/* eslint-disable no-restricted-syntax */
import React from 'react';
import { useScraping } from '../../contexts/scraping';
import { providerToMeta } from '../../providers';
import Button from '../Button';
import { goToUrl } from './ipc';

// the actual scraping window

// I tried hard to make the interactivity changeable but to no avail.
// You have to set from the component's initialization whether a scraping view is interactive.

export default function ScrapingControls({
  hideControls = false,
}: {
  hideControls?: boolean;
}): JSX.Element {
  const {
    state: {
      scrapingConfig,
      isUserLoggedIn,
      isScrapingStarted,
      isScrapingPaused,
      isScrapingFinished,
      scrapingError,
      isMuted,
      scrapingProgress,
      visibleWindow,
    },
    dispatch,
  } = useScraping();

  const resetScraping = async () => {
    await goToUrl(providerToMeta[scrapingConfig.provider].loginUrl, {
      clear: true,
    });
    dispatch({ type: 'reset-scraping' });
  };

  // controls for the scraping

  const pauseScraping = () => {
    dispatch({ type: 'set-scraping-paused', isScrapingPaused: true });
  };

  const resumeScraping = () => {
    dispatch({ type: 'set-scraping-paused', isScrapingPaused: false });
  };

  const toggleIsMuted = () => {
    dispatch({ type: 'set-muted', isMuted: !isMuted });
  };

  const toggleVis = () => {
    dispatch({ type: 'set-visible-window', visibleWindow: !visibleWindow });
  };

  const startScraping = () => {
    dispatch({ type: 'set-scraping-started', isScrapingStarted: true });
  };

  return (
    <>
      <div>
        <p style={{ color: 'red' }}>
          {scrapingError !== null &&
            `${scrapingError.name}: ${scrapingError.message}`}
        </p>
        <br />
        <div className={hideControls ? 'invisible' : ''}>
          <Button onClick={resetScraping}>reset scraping</Button>
          {!isUserLoggedIn && <p>Please login before continuing.</p>}
          {isUserLoggedIn && !isScrapingStarted && (
            <Button onClick={startScraping}>start scraping</Button>
          )}
          {!isScrapingFinished && isScrapingStarted && !isScrapingPaused && (
            <Button onClick={pauseScraping}>pause scraping</Button>
          )}
          {!isScrapingFinished && isScrapingStarted && isScrapingPaused && (
            <Button onClick={resumeScraping}>resume scraping</Button>
          )}

          <Button onClick={toggleIsMuted}>is {!isMuted && 'not'} muted</Button>
          <Button onClick={toggleVis}>
            {!visibleWindow ? 'show' : 'hide'} scraping window
          </Button>
        </div>
        {isScrapingStarted && (
          <progress className="progress" value={scrapingProgress.value} max="1">
            {scrapingProgress.value}
          </progress>
        )}
      </div>
    </>
  );
}
