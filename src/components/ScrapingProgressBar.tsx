import React from 'react';
import { useScraping } from '../contexts';

export default function ScrapingProgressBar() {
  const {
    state: {
      scrapingConfig,
      scrapingProgress: { isActive, value, step },
    },
  } = useScraping();
  if (!isActive) {
    return null;
  }

  const typeDescriptionMap = {
    action: 'Doing stuff (action)',
    profile: 'Doing stuff (profile)',
    video: 'Doing stuff (video)',
    search: 'Doing stuff (search)',
  };
  const currentType = scrapingConfig.steps[step].type;
  const description = typeDescriptionMap[currentType];

  return (
    <div className="mr-4">
      <progress value={value} max="1" className="">
        {value}
      </progress>
      {step} {description}
    </div>
  );
}
