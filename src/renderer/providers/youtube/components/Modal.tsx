import ReactModal from "react-modal";
import Button from "./Button";
import { useModal } from "./modal/context";
import ModalContentComponents from "./modal/ModalContentComponents";

ReactModal.setAppElement("#root");

const Modal = () => {
  const {
    state: { isOpen, componentName },
    dispatch,
  } = useModal();
  const CurrentModalComponent =
    ModalContentComponents[componentName] &&
    ModalContentComponents[componentName];

  const closeModal = () => {
    dispatch({
      type: "set-modal-options",
      options: { isOpen: false },
    });
  };

  return (
    <ReactModal
      isOpen={isOpen}
      // onAfterOpen={afterOpen}
      onRequestClose={closeModal}
      shouldCloseOnOverlayClick
      style={{
        content: {
          transform: "translate(-50%, -50%)",
        },
      }}
      overlayClassName="z-60 fixed inset-0 bg-yellow-1400/50 overflow-auto"
      className="absolute top-1/2 left-1/2 right-auto bottom-auto -mr-[50%] outline-none h-full max-h-[75%] bg-yellow-100 py-8 pl-8 pr-4"
    >
      <div
        className="max-w-prose overflow-y-auto pr-4"
        style={{ maxHeight: "90%" }}
      >
        {CurrentModalComponent && <CurrentModalComponent />}
      </div>
      <div className="mt-4">
        <Button onClick={closeModal}>Schließen</Button>
      </div>
    </ReactModal>
  );
};

export default Modal;
