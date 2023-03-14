/* eslint-disable react/no-array-index-key */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable jsx-a11y/label-has-associated-control */
import _ from "lodash";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "renderer/components/Button";
import ProgressBar from "renderer/components/ProgressBar";
import {
  QuestionCheckboxType,
  QuestionMultiRadioGroupsType,
  QuestionMultiSelectType,
  QuestionNumberType,
  QuestionRadioGroupType,
  QuestionTextAreaType,
  QuestionTextType,
  QuestionTypes,
  useSurvey,
} from "renderer/components/survey/context";

const SurveyTextInput = ({
  question,
  answer,
  onUpdate,
}: {
  question: QuestionTextType | QuestionNumberType;
  answer: string;
  onUpdate: (value: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(answer || "");

  useEffect(() => {
    if (value !== answer) {
      onUpdate(value);
    }
  }, [answer, onUpdate, value]);

  let optionals = {};

  if (question.inputParams) optionals = { ...question.inputParams };

  return (
    <input
      ref={inputRef}
      type={question.type}
      required={question.required}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const v = _.toNumber(e.target.value);
        if (
          question.inputParams &&
          question.inputParams.min &&
          v < question.inputParams.min
        )
          return;
        if (
          question.inputParams &&
          question.inputParams.max &&
          v > question.inputParams.max
        )
          return;
        setValue(v.toString());
      }}
      placeholder={
        question.type === "text"
          ? "Gibt deine Antwort hier ein"
          : "Gib eine Zahl ein"
      }
      className="w-60 rounded border border-black py-1.5 px-2.5 text-lg"
      {...optionals}
    />
  );
};

const SurveyTextAreaInput = ({
  question,
  answer,
  onUpdate,
}: {
  question: QuestionTextAreaType;
  answer: string;
  onUpdate: (value: string) => void;
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(answer || "");

  useEffect(() => {
    if (value !== answer) {
      onUpdate(value);
    }
  }, [answer, onUpdate, value]);

  return (
    <textarea
      ref={inputRef}
      required={question.required}
      value={value}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
        setValue(e.target.value)
      }
      cols={40}
      rows={5}
      placeholder="Gibt deine Antwort hier ein"
      className="rounded border border-black py-1.5 px-2.5 text-lg"
    />
  );
};

const SurveyCheckboxGroup = ({
  question,
  answer,
  onUpdate,
}: {
  question: QuestionCheckboxType;
  answer: string[];
  onUpdate: (value: string[]) => void;
}) => {
  const [checkedItems, setCheckedItems] = useState<string[]>(
    answer && answer.length ? answer : [],
  );
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    const { name } = e.target;

    setCheckedItems((oldState) => {
      let nextState = [...oldState];

      if (checked && !nextState.includes(name)) {
        nextState.push(name);
      } else if (!checked && nextState.includes(name)) {
        nextState = nextState.filter((value) => value !== name);
      }

      return nextState;
    });
  };

  useEffect(() => {
    onUpdate(checkedItems);
  }, [checkedItems, onUpdate]);

  return (
    <div className="flex flex-col divide-y divide-gray-200 text-lg">
      {question.choices.map(({ label, value }) => (
        <label
          key={label}
          className="flex cursor-pointer items-start py-2.5 text-left"
        >
          <input
            type="checkbox"
            checked={value && checkedItems.includes(value) ? true : false}
            name={value}
            onChange={handleChange}
            className="mr-3 mt-1 h-4 w-4 shrink-0 rounded-lg border border-gray-300"
          />
          {label}
        </label>
      ))}
    </div>
  );
};

const SurveyRadioGroup = ({
  question,
  answer,
  onUpdate,
}: {
  question: QuestionRadioGroupType;
  answer: string;
  onUpdate: (value: string) => void;
}) => {
  const [radioValue, setRadioValue] = useState<string>(answer || "");
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setRadioValue(name);
    onUpdate(name);
  };

  return (
    <div className="flex flex-col space-y-2 text-lg">
      {question.choices.map(({ label, value }) => (
        <label key={value} className="flex cursor-pointer items-center">
          <input
            type="radio"
            checked={radioValue === value}
            name={value}
            onChange={handleChange}
            className="mr-2 h-4 w-4 cursor-pointer rounded-lg border border-gray-300"
          />
          {label}
        </label>
      ))}
    </div>
  );
};

const SELECT_UNDEFINED_VALUE = "no-select-option";

const SurveyMultiSelect = ({
  question,
  answer,
  onUpdate,
}: {
  question: QuestionMultiSelectType;
  answer: Array<string | undefined>;
  onUpdate: (value: Array<string | undefined>) => void;
}) => {
  const [selectValue, setSelectValue] = useState(answer || []);
  const handleChange = (index: number, value: string) => {
    const nextState = selectValue.length ? [...selectValue] : [];
    nextState[index] = value === SELECT_UNDEFINED_VALUE ? undefined : value;
    setSelectValue(nextState);
    onUpdate(nextState);
  };

  return (
    <div className="flex flex-col space-y-2">
      {question.choices.map((select, index) => (
        <select
          key={index}
          value={selectValue[index] || SELECT_UNDEFINED_VALUE}
          onChange={(e) => handleChange(index, e.target.value)}
          className="rounded border border-black py-1.5 px-2.5 text-lg"
        >
          {select.map(({ label, value }) => (
            <option key={label} value={value || SELECT_UNDEFINED_VALUE}>
              {label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
};

const SurveyMultiRadioGroups = ({
  question,
  answer,
  onUpdate,
}: {
  question: QuestionMultiRadioGroupsType;
  answer: Array<string | undefined>;
  onUpdate: (value: Array<string | undefined>) => void;
}) => {
  const [radioValue, setRadioValue] = useState(answer || []);
  const handleChange = (index: number, value: string) => {
    const nextState = radioValue.length ? [...radioValue] : [];
    nextState[index] = value;
    setRadioValue(nextState);
    onUpdate(nextState);
  };

  return (
    <div className="flex flex-col space-y-2">
      {question.choices.map((group, index) => (
        <div
          key={index}
          className="grid auto-cols-auto grid-flow-col gap-3 border-b border-gray-200 last:border-none"
        >
          {group.map(({ label, value }) => (
            <label
              key={label}
              className="flex cursor-pointer items-center py-2 text-left first:w-[14rem] last:w-[14rem]"
            >
              <input
                type="radio"
                checked={radioValue[index] === value}
                name={value}
                onChange={(e) => handleChange(index, e.target.name)}
                className="mr-2 h-4 w-4 cursor-pointer rounded-lg border border-gray-300"
              />
              {label}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
};

const Answer = (question: QuestionTypes) => {
  const { saveAnswer, answers } = useSurvey();
  const answer = useMemo(
    () => answers.find((a) => a.name === question.name),
    [answers, question.name],
  );
  const handleUpdate = useCallback(
    (value: string | (string | undefined)[]) => {
      saveAnswer(question.name, value);
    },
    [question.name, saveAnswer],
  );

  if (question.type === "text" || question.type === "number") {
    return (
      <SurveyTextInput
        key={question.name}
        question={question}
        answer={answer?.value as string}
        onUpdate={handleUpdate}
      />
    );
  }

  if (question.type === "textarea") {
    return (
      <SurveyTextAreaInput
        key={question.name}
        question={question}
        answer={answer?.value as string}
        onUpdate={handleUpdate}
      />
    );
  }

  if (question.type === "checkbox") {
    return (
      <SurveyCheckboxGroup
        key={question.name}
        question={question}
        answer={answer?.value as string[]}
        onUpdate={handleUpdate}
      />
    );
  }

  if (question.type === "multiple-select") {
    return (
      <SurveyMultiSelect
        key={question.name}
        question={question}
        answer={answer?.value as string[]}
        onUpdate={handleUpdate}
      />
    );
  }

  if (question.type === "radio-group") {
    return (
      <SurveyRadioGroup
        key={question.name}
        question={question}
        answer={answer?.value as string}
        onUpdate={handleUpdate}
      />
    );
  }

  if (question.type === "muiltiple-radio-groups") {
    return (
      <SurveyMultiRadioGroups
        key={question.name}
        question={question}
        answer={answer?.value as string[]}
        onUpdate={handleUpdate}
      />
    );
  }

  return <div>Could not render answer 🤔</div>;
};

export const Survey = ({
  isComplete,
  setIsComplete,
  close,
}: {
  isComplete: boolean;
  setIsComplete: (value: boolean) => void;
  close: () => void;
}) => {
  const {
    currentQuestion,
    isLastQuestion,
    canGoForward,
    canGoBackward,
    goToNextQuestion,
    goToPreviousQuestion,
    progress,
  } = useSurvey();
  const backButtonIsEnabled = canGoBackward();
  const nextButtonIsEnabled = canGoForward();
  const finishSurvey = () => {
    setIsComplete(true);
  };

  return (
    <div className="flex h-full flex-col justify-between px-8 py-6 text-center">
      {!isComplete ? (
        <>
          <ProgressBar value={progress} />
          <div className="hl-xl flex min-h-[5.25rem] max-w-prose items-center justify-center">
            {currentQuestion.label}
          </div>
          <div className="flex flex-col items-center justify-center">
            <Answer {...currentQuestion} />
          </div>
          <div className="flex justify-between">
            <Button
              disabled={!backButtonIsEnabled}
              onClick={() =>
                backButtonIsEnabled ? goToPreviousQuestion() : undefined
              }
            >
              Zurück
            </Button>
            {!isLastQuestion ? (
              <Button
                disabled={!nextButtonIsEnabled}
                onClick={() =>
                  nextButtonIsEnabled ? goToNextQuestion() : undefined
                }
              >
                Weiter
              </Button>
            ) : (
              <Button
                disabled={!nextButtonIsEnabled}
                onClick={() =>
                  nextButtonIsEnabled ? finishSurvey() : undefined
                }
              >
                Abschließen
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="flex grow flex-col items-center justify-center space-y-4">
          <p className="text-xl font-bold">Vielen Dank für deine Teilnahme!</p>
          <p>Du kannst das Fenster jetzt schließen.</p>
          <div>
            <Button onClick={close}>Schließen</Button>
          </div>
        </div>
      )}
    </div>
  );
};
