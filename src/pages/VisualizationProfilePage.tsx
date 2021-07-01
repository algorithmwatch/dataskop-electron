import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function VisualizationProfilePage(): JSX.Element {
  const [nextButtonIsDisabled, setNextButtonIsDisabled] = useState(true);
  const { getNextPage, getPreviousPage } = useNavigation();

  const {
    state: {
      scrapingProgress: { step },
      scrapingConfig,
    },
  } = useScraping();

  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Zurück',
      theme: 'link',
      startIcon: faAngleLeft,
      clickHandler(history: RouteComponentProps['history']) {
        history.push(getPreviousPage('path'));
      },
    },
    {
      label: 'Weiter',
      // size: 'large',
      endIcon: faAngleRight,
      disabled: nextButtonIsDisabled,
      tippyOptions: {
        content: 'Bitte warten Sie, bis das Scraping beendet ist.',
        theme: 'process-info',
        placement: 'left',
      },
      clickHandler(history: RouteComponentProps['history']) {
        if (!nextButtonIsDisabled) {
          history.push(getNextPage('path'));
        }
      },
    },
  ];

  // check if scraping progress is ahead of current step
  useEffect(() => {
    const stepIndex = scrapingConfig.steps.findIndex(
      (s) => s.type === 'profile',
    );
    if (nextButtonIsDisabled && step > stepIndex) {
      setNextButtonIsDisabled(false);
    }
  }, [step]);

  return (
    <>
      <div className="p-6 max-w-lg mx-auto mb-10 text-center">
        <div>
          <div className="text-xl font-medium">Visualization Profile</div>
          {/* <p className="text-yellow-1200">
            Hello and welcome to this early development version of DataSkop.
          </p> */}
        </div>
      </div>
      <FooterNav items={footerNavItems} />
    </>
  );
}
