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

  return (
    <div className="relative h-4 w-full bg-yellow-100">
      {/* vertical lines */}
      <div className="z-10 absolute inset-0 h-4 w-full flex justify-between">
        {steps.map(({ label, description }) => (
          <div key={label} className="h-full w-0.5 bg-black" />
        ))}
      </div>

      {/* bar */}
      <div
        className="z-0 absolute left-0 inset-y-0 bg-yellow-700 h-full"
        style={{ width: `${barWidth}%` }}
      />
    </div>
  );
}

export default ProcessIndicator;
