import React, { ReactNode } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Button, { ButtonProps } from '../components/Button';
import { useConfig } from '../contexts/config';
import Base from './Base';

interface FooterNavItem extends ButtonProps {
  label: string;
  clickHandler: (history: RouteComponentProps['history']) => void;
}

function SlideBase({
  children,
  footerNav = [],
  isDarkMode = false,
}: {
  children: ReactNode;
  footerNav?: FooterNavItem[];
  isDarkMode?: boolean;
}): JSX.Element {
  const history = useHistory();
  const {
    state: { currentStepIndex },
  } = useConfig();
  const processIndicatorSteps = [
    {
      label: 'Section 1',
    },
    {
      label: 'Section 2',
    },
    {
      label: 'Section 3',
    },
    {
      label: 'Section 4',
    },
    {
      label: 'Section 5',
    },
    {
      label: 'Section 6',
    },
  ];

  return (
    <Base isDarkMode={isDarkMode}>
      {/* Content */}
      <section className="flex-grow flex flex-col justify-center">
        {children}
      </section>

      {/* FooterNav */}
      <nav className="h-40 flex justify-between items-center max-w-4xl w-full mx-auto">
        {footerNav.map(
          ({
            label,
            size,
            theme,
            startIcon,
            endIcon,
            clickHandler,
            disabled,
            classNames,
          }) => (
            <Button
              key={label}
              disabled={disabled}
              startIcon={startIcon}
              endIcon={endIcon}
              size={size}
              theme={theme}
              classNames={classNames}
              onClick={() => clickHandler(history)}
            >
              {label}
            </Button>
          ),
        )}
      </nav>

      {/* Process Indicator */}
      {/* <ProcessIndicator
        steps={processIndicatorSteps}
        currentStep={currentStepIndex}
      /> */}
    </Base>
  );
}

export default SlideBase;
