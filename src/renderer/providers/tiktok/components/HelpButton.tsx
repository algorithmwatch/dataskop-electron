import { faCircleQuestion } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";

export default function HelpButton({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center p-4 text-lg font-semibold rounded-full text-east-blue-800 bg-white shadow focus:ring focus:ring-east-blue-700/80",
        className,
      )}
      {...rest}
    >
      <FontAwesomeIcon
        icon={faCircleQuestion}
        aria-hidden="true"
        className="shrink-0 mr-2 text-3xl"
      />
      {children}
    </button>
  );
}
