import { faAngleLeft, faAngleRight } from '@fortawesome/pro-regular-svg-icons';
import { History } from 'history';
import React, { useState } from 'react';
import Stepper from '../components/Stepper';
import routes from '../constants/routes.json';
import SlideBase from '../layout/SlideBase';

function Step1(): JSX.Element {
  return (
    <>
      <h1 className="hl-5xl text-center mb-6">Das ist eine Überschrift</h1>
      <p className="max-w-prose mx-auto text-lg">
        Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses
        getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!« sagte er,
        es war, als sollte die Scham ihn überleben. Als Gregor Samsa eines
        Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu
        einem ungeheueren Ungeziefer verwandelt. Und es war ihnen wie eine
        Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer
        Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte.
        »Es ist ein eigentümlicher Apparat«, sagte der Offizier zu dem
        Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden
        Blick den ihm doch wohlbekannten Apparat.
      </p>
    </>
  );
}

function Step2(): JSX.Element {
  return (
    <>
      <h1 className="hl-5xl text-center mb-6">Das ist noch eine Überschrift</h1>
      <p className="max-w-prose mx-auto text-lg">
        Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses
        getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!« sagte er,
        es war, als sollte die Scham ihn überleben. Als Gregor Samsa eines
        Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu
        einem ungeheueren Ungeziefer verwandelt. Und es war ihnen wie eine
        Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer
        Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte.
        »Es ist ein eigentümlicher Apparat«, sagte der Offizier zu dem
        Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden
        Blick den ihm doch wohlbekannten Apparat.
      </p>
    </>
  );
}

function Step3(): JSX.Element {
  return (
    <>
      <h1 className="hl-5xl text-center mb-6">Und noch eine Überschrift</h1>
      <p className="max-w-prose mx-auto text-lg">
        Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses
        getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!« sagte er,
        es war, als sollte die Scham ihn überleben. Als Gregor Samsa eines
        Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu
        einem ungeheueren Ungeziefer verwandelt. Und es war ihnen wie eine
        Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer
        Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte.
        »Es ist ein eigentümlicher Apparat«, sagte der Offizier zu dem
        Forschungsreisenden und überblickte mit einem gewissermaßen bewundernden
        Blick den ihm doch wohlbekannten Apparat.
      </p>
    </>
  );
}

export default function ExplanationPage(): JSX.Element {
  const steps = [
    {
      key: 'step1',
      component: Step1,
    },
    {
      key: 'step2',
      component: Step2,
    },
    {
      key: 'step3',
      component: Step3,
    },
  ];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const nextStepIndex = currentStepIndex + 1;
  const hasNextIndex = nextStepIndex < steps.length;
  const handleUpdateIndex = (index) => {
    setCurrentStepIndex(index);
  };

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
      // classNames: '',
      clickHandler(history: History) {
        if (hasNextIndex) {
          setCurrentStepIndex(nextStepIndex);
        } else {
          alert('Slide to login page here');
        }
      },
    },
  ];

  if (hasNextIndex) {
    footerNav.push({
      label: 'Überspringen',
      endIcon: faAngleRight,
      // classNames: '',
      theme: 'link',
      clickHandler(history: History) {
        history.push(routes.EXPLANATION);
      },
    });
  }

  return (
    <SlideBase footerNav={footerNav}>
      <Stepper
        steps={steps}
        currentStepIndex={currentStepIndex}
        updateIndex={handleUpdateIndex}
      />
    </SlideBase>
  );
}
