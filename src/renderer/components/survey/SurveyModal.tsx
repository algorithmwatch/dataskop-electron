import { useEffect } from "react";
import Modal from "../Modal";
import { useSurvey } from "./context";
import { Survey } from "./Survey";

const SurveyModal = ({
  isOpen,
  toggle,
  onChange,
  isComplete,
  setIsComplete,
}: {
  isOpen: boolean;
  toggle: () => void;
  onChange: (isComplete: boolean, value: any) => void;
  isComplete: boolean;
  setIsComplete: (val: boolean) => void;
}) => {
  const { answers, compileResult } = useSurvey();

  useEffect(() => {
    const result = compileResult();
    onChange(isComplete, result);
  }, [answers]);

  return (
    <Modal
      theme="tiktokSurvey"
      isOpen={isOpen}
      closeModal={toggle}
      buttons={[]}
    >
      <Survey
        isComplete={isComplete}
        setIsComplete={setIsComplete}
        close={toggle}
      />
    </Modal>
  );
};

export default SurveyModal;
