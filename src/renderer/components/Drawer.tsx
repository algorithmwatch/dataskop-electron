import { faXmark } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// inspired by https://bensthoughts.dev/blog/react/headless-ui-drawer

type DrawerProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
};

export default function Drawer({
  title = "",
  description = "",
  children,
  isOpen,
  setIsOpen,
}: DrawerProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={() => setIsOpen(false)}
        className="fixed z-30 inset-0 overflow-hidden"
      >
        <div className="w-screen h-screen">
          {/* Background overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="z-40 fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          {/* Drawer */}
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-200"
            enterFrom="-right-96"
            enterTo="right-0"
            leave="transition-all ease-in-out duration-300"
            leaveFrom="right-0"
            leaveTo="-right-96"
          >
            <div
              className={`fixed h-screen flex flex-col space-y-6 items-start bg-white z-50
                          w-96 px-10 pt-24 pb-10
                          shadow-xl`}
            >
              <div>
                <Dialog.Title className="font-bold text-2xl md:text-4xl text-blue-500">
                  {title}
                </Dialog.Title>
                <Dialog.Description>{description}</Dialog.Description>
                {children}
              </div>
              <button
                type="button"
                // className="text-3xl"
                onClick={() => setIsOpen(!isOpen)}
              >
                <FontAwesomeIcon icon={faXmark} size="2x" />
              </button>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
