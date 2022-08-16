import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// inspired by https://bensthoughts.dev/blog/react/headless-ui-drawer

type DrawerProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
};

export default function Drawer({
  title = '',
  description = '',
  children,
  isOpen,
  setIsOpen,
}: DrawerProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        unmount={false}
        onClose={() => setIsOpen(false)}
        className="fixed z-30 inset-0 overflow-hidden"
      >
        <div className="flex w-screen h-screen">
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-30"
            entered="opacity-30"
            leave="transition-opacity ease-out duration-300"
            leaveFrom="opacity-30"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="z-40 fixed inset-0 bg-black" />
          </Transition.Child>

          {/* Drawer */}
          <Transition.Child
            as={Fragment}
            enter="transition-all absolute"
            entered="absolute"
            enterFrom="-right-96"
            enterTo="right-0"
            leave="transition-all absolute"
            leaveFrom="right-0"
            leaveTo="-right-96"
          >
            <div
              className={`flex flex-col justify-between bg-gray-500 z-50
                          w-96 p-6 overflow-hidden text-left
                          align-middle shadow-xl rounded-r-2xl`}
            >
              <div>
                <Dialog.Title className="font-bold text-2xl md:text-4xl text-blue-500">
                  {title}
                </Dialog.Title>
                <Dialog.Description>{description}</Dialog.Description>
                {children}
              </div>
              <div className="self-center mt-10">
                Das ist ein test
                <span onClick={() => setIsOpen(!isOpen)}>Schließen</span>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
