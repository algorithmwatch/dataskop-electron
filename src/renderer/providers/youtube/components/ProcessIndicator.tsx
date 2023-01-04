/* eslint-disable react/jsx-props-no-spreading */
import Tippy, { TippyProps } from "@tippyjs/react";
import classNames from "classnames";
import React from "react";

const ProcessIndicator = ({
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
}): JSX.Element => {
  const stepsKeys = Object.keys(steps);
  const stepsValues = Object.values(steps);
  const stepsCount = stepsKeys.length;
  const currentStepIndex = stepsKeys.indexOf(currentStep);
  const barWidth = (100 * currentStepIndex) / (stepsCount - 1);
  const barWidthPlusPadding = `calc(${barWidth}% + 3rem)`;

  return (
    <div className="px-12">
      <div
        className={classNames(
          "relative h-2 w-full transition-opacity",
          !currentStep.length ? "opacity-0" : "opacity-100",
        )}
      >
        {/* vertical lines */}
        <div className="z-10 absolute inset-0 h-2 w-full flex justify-between">
          {stepsValues.map(({ label }, index) => {
            const tippyProps: TippyProps = {
              content: <span>{label}</span>,
              theme: "process-info",
              placement: "top-start",
              zIndex: 35,
            };
            const isCurrentStep = stepsKeys[index] === currentStep;

            if (isCurrentStep) {
              tippyProps.theme = "process-info-current";
              tippyProps.visible = true;
            }

            // key changes if it's current step or not
            return (
              <div
                key={`${label}-${isCurrentStep}`}
                className="h-full w-0.5 bg-yellow-1500"
              >
                <Tippy {...tippyProps}>
                  <div className="h-full -mx-12 " />
                </Tippy>
              </div>
            );
          })}
        </div>

        {/* bar */}
        <div
          className="z-0 absolute -left-12 inset-y-0 bg-yellow-700 h-full transition-all duration-500 ease-in-out"
          style={{ width: barWidthPlusPadding }}
        />
      </div>
    </div>
  );
};

export default React.memo(ProcessIndicator);
