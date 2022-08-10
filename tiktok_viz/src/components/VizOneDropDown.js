// import React, { useState } from "react";

// const DropDown = () => {
//   return (
//     // <!-- This example requires Tailwind CSS v2.0+ -->
//     <div class="relative inline-block text-left">
//       <div>
//         <button
//           type="button"
//           class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
//           id="menu-button"
//           aria-expanded="true"
//           aria-haspopup="true"
//         >
//           {/* <!-- Heroicon name: solid/chevron-down --> */}
//           <svg
//             class="-mr-1 ml-2 h-5 w-5"
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//             aria-hidden="true"
//           >
//             <path
//               fill-rule="evenodd"
//               d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//               clip-rule="evenodd"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* <!--
//             Dropdown menu, show/hide based on menu state.

//             Entering: "transition ease-out duration-100"
//             From: "transform opacity-0 scale-95"
//             To: "transform opacity-100 scale-100"
//             Leaving: "transition ease-in duration-75"
//             From: "transform opacity-100 scale-100"
//             To: "transform opacity-0 scale-95"
//         --> */}
//       <div
//         class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none"
//         role="menu"
//         aria-orientation="vertical"
//         aria-labelledby="menu-button"
//         tabindex="-1"
//       >
//         <div class="py-1" role="none">
//           {/* <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" --> */}
//           <a
//             href="#"
//             class="text-gray-700 block px-4 py-2 text-sm"
//             role="menuitem"
//             tabindex="-1"
//             id="menu-item-0"
//           >
//             Edit
//           </a>
//           <a
//             href="#"
//             class="text-gray-700 block px-4 py-2 text-sm"
//             role="menuitem"
//             tabindex="-1"
//             id="menu-item-1"
//           >
//             Duplicate
//           </a>
//         </div>
//         <div class="py-1" role="none">
//           <a
//             href="#"
//             class="text-gray-700 block px-4 py-2 text-sm"
//             role="menuitem"
//             tabindex="-1"
//             id="menu-item-2"
//           >
//             Archive
//           </a>
//           <a
//             href="#"
//             class="text-gray-700 block px-4 py-2 text-sm"
//             role="menuitem"
//             tabindex="-1"
//             id="menu-item-3"
//           >
//             Move
//           </a>
//         </div>
//         <div class="py-1" role="none">
//           <a
//             href="#"
//             class="text-gray-700 block px-4 py-2 text-sm"
//             role="menuitem"
//             tabindex="-1"
//             id="menu-item-4"
//           >
//             Share
//           </a>
//           <a
//             href="#"
//             class="text-gray-700 block px-4 py-2 text-sm"
//             role="menuitem"
//             tabindex="-1"
//             id="menu-item-5"
//           >
//             Add to favorites
//           </a>
//         </div>
//         <div class="py-1" role="none">
//           <a
//             href="#"
//             class="text-gray-700 block px-4 py-2 text-sm"
//             role="menuitem"
//             tabindex="-1"
//             id="menu-item-6"
//           >
//             Delete
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DropDown;

/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { PencilAltIcon } from "@heroicons/react/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DropDown(props) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
          {props.text}
          <PencilAltIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  letzte 7 Tage
                </a>
              )}
            </Menu.Item>
          </div>
          <div>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  letzte 30 Tage
                </a>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  letzte 90 Tage
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
