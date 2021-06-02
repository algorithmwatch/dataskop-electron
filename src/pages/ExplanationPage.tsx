import React from 'react';

function Step1(): JSX.Element {
  return (
    <>
      <h1 className="hl-4xl text-center mb-6">Das ist eine Überschrift</h1>
      <p className="max-w-prose mx-auto text-lg">
        Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses
        getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!« sagte er,
        es war, als sollte die Scham ihn überleben. Als Gregor Samsa eines
        Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu
        einem ungeheueren Ungeziefer verwandelt.
      </p>
    </>
  );
}

function Step2(): JSX.Element {
  return (
    <>
      <h1 className="hl-4xl text-center mb-6">Das ist noch eine Überschrift</h1>
      <p className="max-w-prose mx-auto text-lg">
        Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten
        Absichten, als am Ziele ihrer Fahrt die Tochter als erste sich erhob und
        ihren jungen Körper dehnte. »Es ist ein eigentümlicher Apparat«, sagte
        der Offizier zu dem Forschungsreisenden und überblickte mit einem
        gewissermaßen bewundernden Blick den ihm doch wohlbekannten Apparat.
      </p>
    </>
  );
}

function Step3(): JSX.Element {
  return (
    <>
      <h1 className="hl-4xl text-center mb-6">Und noch eine Überschrift</h1>
      <p className="max-w-prose mx-auto text-lg">
        Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses
        getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!« sagte er,
        es war, als sollte die Scham ihn überleben. Als Gregor Samsa eines
        Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu
        einem ungeheueren Ungeziefer verwandelt. Und es war ihnen wie eine
        Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer
        Fahrt die Tochter als erste sich erhob und ihren jungen Körper dehnte.
      </p>
    </>
  );
}

function ExplanationPage(): JSX.Element {
  // const steps = [
  //   {
  //     key: 'step1',
  //     component: Step1,
  //   },
  //   {
  //     key: 'step2',
  //     component: Step2,
  //   },
  //   {
  //     key: 'step3',
  //     component: Step3,
  //   },
  // ];
  // const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // const nextStepIndex = currentStepIndex + 1;
  // const hasNextIndex = nextStepIndex < steps.length;
  // const handleUpdateIndex = (index) => {
  //   setCurrentStepIndex(index);
  // };
  // const footerNav = [
  //   {
  //     label: 'Zurück',
  //     startIcon: faAngleLeft,
  //     theme: 'link',
  //     clickHandler(history: History) {
  //       history.go(-1);
  //     },
  //   },
  //   {
  //     label: 'Weiter',
  //     endIcon: faAngleRight,
  //     clickHandler(history: History) {
  //       if (hasNextIndex) {
  //         setCurrentStepIndex(nextStepIndex);
  //       } else {
  //         history.push(routes.PROVIDER_LOGIN);
  //       }
  //     },
  //   },
  // ];
  // const { dispatch } = useConfig();

  // useEffect(() => {
  //   dispatch({ type: 'set-current-step-index', currentStepIndex: 1 });
  // });

  // if (hasNextIndex) {
  //   footerNav.push({
  //     label: 'Überspringen',
  //     endIcon: faAngleRight,
  //     theme: 'link',
  //     clickHandler(history: History) {
  //       history.push(routes.PROVIDER_LOGIN);
  //     },
  //   });
  // }

  return (
    <>
      das ist ein test
      {/* <Stepper
        steps={steps}
        currentStepIndex={currentStepIndex}
        updateIndex={handleUpdateIndex}
      /> */}
    </>
  );
}

export default ExplanationPage;
