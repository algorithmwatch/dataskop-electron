import {
  faCaretDown,
  faCheck,
  IconDefinition,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

type Option = {
  id: string;
  label: string;
  value: any;
  disabled?: boolean;
};

export const SelectInput = ({
  options,
  selectedOption,
  onUpdate,
  buttonIcon = faCaretDown,
}: {
  options: Option[];
  selectedOption: Option;
  onUpdate: (val: Option) => void;
  buttonIcon?: IconDefinition;
}) => {
  return (
    <Listbox value={selectedOption} onChange={onUpdate}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg font-bold underline bg-white py-2 pl-2 pr-10 text-xl text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300">
          <span className="block truncate">{selectedOption.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon icon={buttonIcon} aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.id}
                value={option}
                disabled={option.disabled}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900 ${
                    active ? "bg-neutral-100" : ""
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate text-left ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FontAwesomeIcon
                          icon={faCheck}
                          aria-hidden="true"
                          className="text-turquoise-900"
                        />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
