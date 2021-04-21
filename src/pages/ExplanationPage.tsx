import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import React, { useState } from 'react';
import routes from '../constants/routes.json';
import SlideBase from '../layout/SlideBase';

function Step1(): JSX.Element {
  return (
    <div>
      Step1 Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
      molestiae laboriosam adipisci odio molestias eligendi, illo fugit ad
      impedit repellendus nulla beatae unde quasi eaque ea consequatur
      recusandae velit necessitatibus!
    </div>
  );
}

function Step2(): JSX.Element {
  return (
    <div>
      Step2 Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
      molestiae laboriosam adipisci odio molestias eligendi, illo fugit ad
      impedit repellendus nulla beatae unde quasi eaque ea consequatur
      recusandae velit necessitatibus!
    </div>
  );
}

function Step3(): JSX.Element {
  return (
    <div>
      Step3 Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
      molestiae laboriosam adipisci odio molestias eligendi, illo fugit ad
      impedit repellendus nulla beatae unde quasi eaque ea consequatur
      recusandae velit necessitatibus!
    </div>
  );
}

export default function ExplanationPage(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0);

  const stepWizard = (
    <Wizard>
      <Steps>
        <Step id="step1">Step1</Step>
        <Step id="step2">Step2</Step>
        <Step id="step3">Step3</Step>
      </Steps>
    </Wizard>
  );

  const footerNav = [
    {
      label: 'Zurück',
      startIcon: faAngleLeft,
      classNames: '',
      theme: 'link',
      // disabled: true,
      clickHandler(history: History) {
        history.go(-1);
      },
    },
    {
      label: 'Weiter',
      // size: 'large',
      endIcon: faAngleRight,
      classNames: 'mx-auto',
      clickHandler(history: History) {
        setCurrentStep(currentStep + 1);
        // console.warn('test', stepWizard.type.nextStep);
        // stepWizard.props.nextStep();

        // history.push(routes.EXPLANATION);
      },
    },
    {
      label: 'Überspringen',
      endIcon: faAngleRight,
      // classNames: '',
      theme: 'link',
      clickHandler(history: History) {
        history.push(routes.EXPLANATION);
      },
    },
  ];

  return <SlideBase footerNav={footerNav}>{currentStep}</SlideBase>;
}
