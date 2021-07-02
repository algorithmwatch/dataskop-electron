import { faSpinnerThird } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useScraping } from '../contexts';

export default function ScrapingProgressBar() {
  const {
    state: {
      scrapingConfig,
      scrapingProgress: { isActive, value, step },
    },
  } = useScraping();
  // if (!isActive) {
  //   return null;
  // }

  const typeDescriptionMap = {
    action: 'Überprüfe Traktorstrahl…',
    profile: 'Starte den Laser…',
    video: 'Überprüfe Druckkabine…',
    search: 'Überprüfe Hyperraumantrieb…',
  };
  const currentType = scrapingConfig.steps[step].type;
  const description = typeDescriptionMap[currentType];

  return (
    <div className="max-w-min h-7 relative flex items-center bg-yellow-300">
      <div className="z-10 flex items-center px-2 space-x-1.5">
        <FontAwesomeIcon
          icon={faSpinnerThird}
          spin
          size="sm"
          className="text-yellow-1400"
        />
        <div className="z-10 relative text-sm text-yellow-1200 whitespace-nowrap pr-3">
          {description}
        </div>
      </div>
      <div
        className="z-0 absolute inset-y-0 left-0 bg-yellow-600"
        style={{ width: '30%' }}
      />
    </div>
  );
}
