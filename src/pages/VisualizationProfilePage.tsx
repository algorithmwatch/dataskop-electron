import { faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import FooterNav, { FooterNavItem } from '../components/FooterNav';
import { useScraping } from '../contexts';
import { useNavigation } from '../contexts/navigation';

export default function VisualizationProfilePage(): JSX.Element {
  const [nextButtonIsDisabled, setNextButtonIsDisabled] = useState(true);
  const { getNextPage } = useNavigation();
  const {
    state: {
      scrapingProgress: { step },
      scrapingConfig,
    },
  } = useScraping();
  const footerNavItems: FooterNavItem[] = [
    {
      label: 'Weiter',
      // size: 'large',
      endIcon: faAngleRight,
      classNames: 'mx-auto',
      disabled: nextButtonIsDisabled,
      clickHandler(history: RouteComponentProps['history']) {
        if (!nextButtonIsDisabled) {
          history.push(getNextPage('path'));
        }
      },
    },
  ];

  useEffect(() => {
    const currentStep = scrapingConfig.steps.filter(
      (s) => s.type === 'profile',
    )[0];
    const stepIndex = scrapingConfig.steps.indexOf(currentStep);

    if (step > stepIndex && nextButtonIsDisabled) {
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
