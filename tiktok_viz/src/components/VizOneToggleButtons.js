import React from "react";

const ToggleButton = (props) => {
  return (
    <>
      <label
        htmlFor={props.toggleColor} //"yellow-toggle"
        className="inline-flex relative items-center mr-5 cursor-pointer"
      >
        <input
          type="checkbox"
          defaultValue=""
          id={props.toggleColor} //"yellow-toggle"
          className="sr-only peer"
          defaultChecked=""
        />
        <div className={props.classname1} />{" "}
        {/* //"w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"  */}
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          {props.textLabel}
        </span>
      </label>
      {/* <label
        htmlFor="teal-toggle"
        className="inline-flex relative items-center mr-5 cursor-pointer"
      >
        <input
          type="checkbox"
          defaultValue=""
          id="teal-toggle"
          className="sr-only peer"
          defaultChecked=""
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600" />
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Teal
        </span>
      </label>
      <label
        htmlFor="orange-toggle"
        className="inline-flex relative items-center mr-5 cursor-pointer"
      >
        <input
          type="checkbox"
          defaultValue=""
          id="orange-toggle"
          className="sr-only peer"
          defaultChecked=""
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500" />
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Orange
        </span>
      </label> */}
    </>
  );
};

export default ToggleButton;
