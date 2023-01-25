import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, ReactNode } from "react";
import { Button } from "renderer/components/Button";

type ModalProps = {
  title?: string;
  theme: keyof typeof themes;
  isOpen: boolean;
  closeModal: () => void;
  buttons?: ReturnType<typeof Button>[];
  children: ReactNode;
};

const themes = {
  tiktok: {
    backdrop: "bg-white/80",
    title: "",
    panel:
      "max-w-3xl rounded-5xl bg-gradient-to-br from-[#B5FFFD] to-[#FFB8CE] p-1.5 shadow-flat",
    contentWrap: "bg-white rounded-4xl",
    content: "p-20 max-w-prose text-lg mx-auto",
    footer: "pb-10 flex items-center justify-center",
  },
  tiktokSurvey: {
    backdrop: "bg-white/80",
    title: "",
    panel:
      "flex max-w-5xl min-h-[36rem] rounded-5xl bg-gradient-to-br from-[#B5FFFD] to-[#FFB8CE] p-1.5 shadow-flat",
    contentWrap: "bg-white rounded-4xl grow flex",
    content: "p-4 text-lg w-full",
    footer: "pb-10 flex items-center justify-center",
  },
};

const Modal = ({
  title,
  theme,
  isOpen,
  closeModal,
  buttons,
  children,
}: ModalProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog className="relative z-50" onClose={closeModal}>
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={clsx("fixed inset-0", themes[theme].backdrop)}
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Full-screen scrollable container */}
        <div className="fixed inset-0 overflow-y-auto">
          {/* Container to center the panel */}
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  "w-full transform align-middle",
                  themes[theme].panel,
                )}
              >
                <div className={themes[theme].contentWrap}>
                  {title && (
                    <Dialog.Title className={themes[theme].title}>
                      {title}
                    </Dialog.Title>
                  )}

                  <div className={themes[theme].content}>{children}</div>

                  {(typeof buttons === "undefined" ||
                    (buttons && buttons.length > 0)) && (
                    <footer className={themes[theme].footer}>
                      {buttons || (
                        <Button onClick={closeModal}>Schließen</Button>
                      )}
                    </footer>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
