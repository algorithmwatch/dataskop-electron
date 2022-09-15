import { Switch as Switcher } from "@headlessui/react";
import clsx from "clsx";

const Switch = ({
  label,
  checked,
  disabled = false,
  onChange,
  className,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
  className?: string;
}) => {
  return (
    <Switcher.Group>
      <div className={clsx("flex items-center justify-start", className)}>
        <Switcher
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="group relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-east-blue-600 focus:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-full w-full rounded-md"
          />
          <span
            aria-hidden="true"
            className={clsx(
              { "bg-neutral-200": checked && !disabled },
              { "bg-neutral-300": checked && disabled },
              { "bg-neutral-300": !checked },
              "pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out",
            )}
          />
          <span
            aria-hidden="true"
            className={clsx(
              { "bg-east-blue-600": checked && !disabled },
              { "bg-neutral-500": checked && disabled },
              checked ? "translate-x-5 " : "translate-x-0 bg-east-blue-700",
              "pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full shadow ring-0 transition-transform duration-200 ease-in-out",
            )}
          />
        </Switcher>
        <Switcher.Label
          as="span"
          className={clsx("cursor-pointer pl-2 font-medium", {
            "text-neutral-600": disabled,
          })}
        >
          {label}
        </Switcher.Label>
      </div>
    </Switcher.Group>
  );
};

export default Switch;
