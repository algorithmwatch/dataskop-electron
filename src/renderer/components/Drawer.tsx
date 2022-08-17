import { faXmark } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// inspired by https://bensthoughts.dev/blog/react/headless-ui-drawer

type DrawerProps = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  children: React.ReactNode;
};

export default function Drawer({ children, isOpen, setIsOpen }: DrawerProps) {
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
              className={`fixed h-screen bg-white z-50
                          w-96 shadow-xl`}
            >
              {/* close button */}
              <button
                type="button"
                className="absolute right-4 top-4 text-3xl"
                onClick={() => setIsOpen(!isOpen)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>

              {/* menu content */}
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
