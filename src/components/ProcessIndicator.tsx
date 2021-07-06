import Tippy from '@tippyjs/react';
import classNames from 'classnames';
import React from 'react';

function ProcessIndicator({
  currentStep,
  steps,
}: {
  currentStep: string;
  steps: {
    [key: string]: {
      label: string;
      description?: string;
    };
  };
}): JSX.Element {
  const stepsKeys = Object.keys(steps);
  const stepsValues = Object.values(steps);
  const stepsCount = stepsKeys.length;
  const currentStepIndex = stepsKeys.indexOf(currentStep);
  const barWidth = (100 * currentStepIndex) / (stepsCount - 1);
  const barWidthPlusPadding = `calc(${barWidth}% + 1.5rem)`;

  return (
    <div className="px-6">
      <div
        className={classNames(
          'relative h-2 w-full transition-opacity',
          !currentStep.length ? 'opacity-0' : 'opacity-100',
        )}
      >
        {/* vertical lines */}
        <div className="z-10 absolute inset-0 h-2 w-full flex justify-between">
          {stepsValues.map(({ label, description }) => (
            <div key={label} className="h-full w-0.5 bg-yellow-1500">
              <Tippy
                content={<span>{label}</span>}
                theme="process-info"
                placement="top-start"
              >
                <div className="h-full -mx-6 " />
              </Tippy>
            </div>
          ))}
        </div>

        {/* bar */}
        <div
          className="z-0 absolute -left-6 inset-y-0 bg-yellow-700 h-full transition-all duration-500 ease-in-out"
          style={{ width: barWidthPlusPadding }}
        />
      </div>
    </div>
  );
}

export default ProcessIndicator;
