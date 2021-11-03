// @ts-nocheck

/* eslint-disable react-hooks/exhaustive-deps */
import { faSpinnerThird } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useScraping } from '../../../contexts';

export default function ScrapingProgressBar() {
  const {
    state: {
      scrapingConfig,
      visibleWindow,
      scrapingProgress: { isActive, value, step },
      finishedTasks,
    },
    dispatch,
    getEtaUntil,
  } = useScraping();

  const [etaMin, setEtaMin] = useState('1-2 Minuten');

  // useEffect(() => {
  //   if (finishedTasks > 5) {
  //     const etaMs = getEtaUntil(1);
  //     if (etaMs === null) return;
  //     const minutes = Math.round(etaMs / 1000 / 60);
  //     if (minutes >= 2) {
  //       setEtaMin(`${minutes} Minuten`);
  //     } else if (minutes === 1) {
  //       setEtaMin('eine Minute');
  //     } else {
  //       setEtaMin('unter eine Minute');
  //     }
  //   } else {
  //     setEtaMin('10 Minuten');
  //   }
  // }, [finishedTasks]);

  // if (!isActive) {
  //   return null;
  // }

  const typeDescriptionMap = {
    action: 'Scraping Profil',
    profile: 'Scraping Profil',
    video: 'Empfehlungsexperimente…',
    search: 'Suchexperiment…',
  };
  const currentType = scrapingConfig.steps[step].type;
  const description = typeDescriptionMap[currentType];

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="mx-auto flex flex-col h-full">
      <div className="flex-grow flex items-center">
        <div className="z-20 flex items-center space-x-2 text-yellow-1300 group-hover:text-yellow-1100  backdrop-filter backdrop-contrast-125 cursor-wait p-10 shadow rounded-lg">
          <FontAwesomeIcon icon={faSpinnerThird} spin size="4x" className="" />
          <div className="pl-3 items-left">
            <div className="text-xl">{description}</div>
            <div className="text-xs">{etaMin}</div>
          </div>
        </div>
        {/* <div className="z-0 absolute bottom-0 inset-x-0 h-1 bg-yellow-300">
          <div
            className="bg-yellow-700 h-full"
            style={{ width: `${value * 100}%` }}
          />
        </div> */}
      </div>
    </div>
  );
}
