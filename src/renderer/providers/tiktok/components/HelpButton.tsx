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
        "inline-flex items-center justify-center p-4 text-lg font-medium rounded-full text-turquoise-700 bg-white shadow-sm focus:ring focus:ring-turquoise-600/60",
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
