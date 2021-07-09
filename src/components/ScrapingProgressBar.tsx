import { faSpinnerThird } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useScraping } from '../contexts';

export default function ScrapingProgressBar() {
  const {
    state: {
      scrapingConfig,
      visibleWindow,
      scrapingProgress: { isActive, value, step },
    },
    dispatch,
  } = useScraping();
  if (!isActive) {
    return null;
  }

  const typeDescriptionMap = {
    action: 'Scraping…',
    profile: 'Profildaten…',
    video: 'Empfehlungsexperimente…',
    search: 'Suchexperiment…',
  };
  const currentType = scrapingConfig.steps[step].type;
  const description = typeDescriptionMap[currentType];

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="max-w-min h-10 relative flex items-center cursor-pointer group"
      onClick={() =>
        dispatch({ type: 'set-visible-window', visibleWindow: !visibleWindow })
      }
    >
      <div className="z-20 flex items-center px-2 space-x-2 text-yellow-1300 group-hover:text-yellow-1100">
        <FontAwesomeIcon icon={faSpinnerThird} spin size="sm" className="" />
        <div className="relative text-sm whitespace-nowrap pr-3">
          {description}
        </div>
      </div>
      <div className="z-0 absolute bottom-0 inset-x-0 h-1 bg-yellow-300">
        <div
          className="bg-yellow-700 h-full"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}
