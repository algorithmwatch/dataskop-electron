/* eslint-disable no-plusplus */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  QuestionChoiceValue,
  QuestionName,
  QuestionsWithChoicesTypes,
  QuestionTypes,
} from "./types";

type SurveyContextType = {
  currentQuestion: QuestionTypes;
  isLastQuestion: boolean;
  canGoForward: () => boolean;
  canGoBackward: () => boolean;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  saveAnswer: (name: QuestionName, value: AnswerValueType) => void;
  answers: AnswerType[];
  compileResult: () => void;
};
export type AnswerValueType =
  | QuestionChoiceValue["value"]
  | QuestionChoiceValue["value"][]
  | QuestionChoiceValue["value"][][]
  | null;
export type AnswerType = {
  name: QuestionName;
  value: AnswerValueType;
};

const buildAnswersState = (questions: QuestionTypes[]): AnswerType[] =>
  questions.map((q) => ({
    name: q.name,
    value: null,
  }));

const validateQuestionMarkup = (questions: QuestionTypes[]) => {
  const foundNames: string[] = [];

  for (const question of questions) {
    const { name } = question;
    if (foundNames.includes(name)) {
      throw new Error(
        `Invalid survey markup: Question name "${name}" already exists.`,
      );
    }
    foundNames.push(name);
  }
};

const SurveyContext = createContext<SurveyContextType | null>(null);

export const SurveyProvider = ({
  questions,
  children,
}: {
  questions: QuestionTypes[];
  children: ReactNode;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(buildAnswersState(questions));
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // question names must be unqiuem
  // check and throw error if not
  validateQuestionMarkup(questions);

  const questionIsVisible = (question: QuestionTypes) => {
    if (typeof question.visibleIf === "undefined") {
      return true;
    }

    const questionTypesWithChoices: QuestionsWithChoicesTypes["type"][] = [
      "checkbox",
      "radio-group",
    ];
    const questionName = question.visibleIf.name;
    const dependentQuestion = questions.find(
      (q) =>
        q.name === questionName &&
        questionTypesWithChoices.some((t) => t === q.type),
    ) as QuestionsWithChoicesTypes | undefined;

    if (!dependentQuestion) {
      throw new Error("Could not find dependent question");
    }

    const wantedValue = question.visibleIf.hasValue;
    const questionHasWantedAnswer =
      answers.find((a) => a.name === questionName)?.value === wantedValue;

    return questionHasWantedAnswer === true;
  };

  const getNextQuestionIndex = () => {
    for (let index = currentIndex + 1; index < questions.length; index++) {
      const nextQuestion = questions[index];

      if (typeof nextQuestion === "undefined") {
        return;
      }

      if (questionIsVisible(nextQuestion)) {
        return index;
      }
    }
  };

  const getPreviousQuestionIndex = () => {
    if (currentIndex === 0) {
      return;
    }

    for (let index = currentIndex - 1; index >= 0; index--) {
      const previousQuestion = questions[index];

      if (typeof previousQuestion === "undefined") {
        return;
      }

      if (questionIsVisible(previousQuestion)) {
        return index;
      }
    }
  };

  const currentQuestionAnswerIsValid = () => {
    if (!currentQuestion.required) {
      return true;
    }

    const questionName = currentQuestion.name;
    const answer = answers.find((a) => a.name === questionName);

    if (!answer) {
      throw new Error(`Could not find answer for question ${questionName}`);
    }

    const { value } = answer;
    if (Array.isArray(value)) {
      const flatValue = value.flat().filter(Boolean);

      if (currentQuestion.type === "multiple-select") {
        if (flatValue.length === currentQuestion.choices.length) {
          return true;
        }
      } else if (flatValue.length) {
        return true;
      }
    } else if (typeof value === "string" && value.length) {
      if (currentQuestion.type === "number" && currentQuestion.charLength) {
        return value.length === currentQuestion.charLength;
      }
      return true;
    }

    return false;
  };

  const canGoForward = () => {
    if (!isLastQuestion && typeof getNextQuestionIndex() === "undefined") {
      return false;
    }

    return currentQuestionAnswerIsValid();
  };

  const canGoBackward = () => {
    if (typeof getPreviousQuestionIndex() === "undefined") {
      return false;
    }

    return true;
  };

  const goToNextQuestion = () => {
    const nextQuestionIndex = getNextQuestionIndex();

    if (typeof nextQuestionIndex === "undefined") {
      throw new Error("Could not find next question");
    }

    setCurrentIndex(nextQuestionIndex);
  };

  const goToPreviousQuestion = () => {
    const previousQuestionIndex = getPreviousQuestionIndex();

    if (typeof previousQuestionIndex === "undefined") {
      throw new Error("Could not find previous question");
    }

    setCurrentIndex(previousQuestionIndex);
  };

  const saveAnswer = useCallback(
    (name: QuestionName, value: AnswerValueType) =>
      setAnswers((oldState) =>
        oldState.map((answer) => {
          if (answer.name !== name) {
            return answer;
          }
          return {
            ...answer,
            value,
          };
        }),
      ),
    [],
  );

  // Creates readable array of objects with Survey results
  const compileResult = () => {
    const result = [];

    for (const answer of answers) {
      const questionName = answer.name;
      const questionLabel = questions.find(
        (q) => q.name === questionName,
      )?.label;

      if (!questionLabel) {
        throw new Error(`Question not found for identifier ${questionName}`);
      }

      result.push({
        label: questionLabel,
        ...answer,
      });
    }

    return result;
  };

  return (
    <SurveyContext.Provider
      value={{
        currentQuestion,
        isLastQuestion,
        canGoForward,
        canGoBackward,
        goToNextQuestion,
        goToPreviousQuestion,
        saveAnswer,
        answers,
        compileResult,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => {
  const context = useContext(SurveyContext);

  if (!context)
    throw new Error("useSurvey must be used inside a `SurveyProvider`");

  return context;
};
