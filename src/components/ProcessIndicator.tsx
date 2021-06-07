import Tippy from '@tippyjs/react';
import React from 'react';

function ProcessIndicator({
  currentStep = 0,
  steps = [],
}: {
  currentStep: number;
  steps: {
    label: string;
    description?: string;
  }[];
}): JSX.Element {
  const barWidth = (100 * currentStep) / (steps.length - 1);
  const barWidthPlusPadding = `calc(${barWidth}% + 1.5rem)`;

  return (
    <div className="px-6">
      <div className="relative h-2 w-full">
        {/* vertical lines */}
        <div className="z-10 absolute inset-0 h-2 w-full flex justify-between">
          {steps.map(({ label, description }) => (
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
