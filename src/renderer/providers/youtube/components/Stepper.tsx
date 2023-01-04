import classNames from "classnames";
import { useEffect, useState } from "react";

const Stepper = ({ steps, currentStepIndex = 0, updateIndex }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];

  useEffect(() => {
    // step index has changed from outside
    if (stepIndex !== currentStepIndex) {
      setStepIndex(currentStepIndex);
    }
  }, [currentStepIndex]);

  const updateStepIndex = (key) => {
    const index = steps.findIndex((step) => step.key === key);
    updateIndex(index);
  };

  return (
    <div className="flex-grow flex flex-col">
      <div className="flex-grow flex flex-col justify-center">
        {currentStep && currentStep.component()}
      </div>
      <div className="mt-6 flex justify-center space-x-4">
        {steps.map(({ key, component }) => (
          <button
            type="button"
            aria-label="Weiter"
            key={key}
            onClick={() => updateStepIndex(key)}
            className={classNames({
              "w-5 h-5 rounded-full border focus:outline-none": true,
              "border-yellow-500 bg-yellow-500": currentStep.key === key,
              "border-yellow-500": currentStep.key !== key,
            })}
          />
        ))}
      </div>
    </div>
  );
};

export default Stepper;
