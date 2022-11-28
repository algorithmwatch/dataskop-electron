export type QuestionName = string;
export type QuestionChoiceValue = {
  label: string;
  value?: string;
};

export type QuestionDependency = {
  name: QuestionName;
  hasValue: QuestionChoiceValue["value"];
};

export type Question = {
  name: QuestionName;
  label: string;
  visibleIf?: QuestionDependency;
  required?: boolean;
};

export type QuestionTextType = Question & {
  type: "text";
};

export type QuestionTextAreaType = Question & {
  type: "textarea";
};

export type QuestionNumberType = Question & {
  type: "number";
};

export type QuestionCheckboxType = Question & {
  type: "checkbox";
  choices: QuestionChoiceValue[];
};

export type QuestionRadioGroupType = Question & {
  type: "radio-group";
  choices: QuestionChoiceValue[];
};

export type QuestionMultiRadioGroupsType = Question & {
  type: "muiltiple-radio-groups";
  choices: QuestionChoiceValue[][];
};

// export type QuestionSelectType = Question & {
//   type: "select";
//   choices: QuestionChoiceValue[];
// };

export type QuestionMultiSelectType = Question & {
  type: "multiple-select";
  choices: QuestionChoiceValue[][];
};

export type QuestionTypes =
  | QuestionTextType
  | QuestionTextAreaType
  | QuestionNumberType
  | QuestionCheckboxType
  | QuestionRadioGroupType
  | QuestionMultiRadioGroupsType
  | QuestionMultiSelectType;
// | QuestionSelectType

export type QuestionsWithChoicesTypes =
  | QuestionCheckboxType
  | QuestionRadioGroupType;
// | QuestionSelectType;
