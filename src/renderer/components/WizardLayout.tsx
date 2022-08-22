import clsx from "clsx";
import { ReactNode } from "react";

export default function WizardLayout({
  className,
  children,
  footerButtons = [],
}: {
  className?: string;
  children: ReactNode;
  footerButtons?: ReactNode;
}) {
  return (
    <>
      <div className="grow min-h-0 h-full mx-auto flex flex-col justify-center">
        <div className={clsx("max-w-prose", className)}>{children}</div>
      </div>
      {footerButtons && (
        <nav className="h-24 shrink-0 flex justify-center items-center px-6 space-x-4">
          {footerButtons}
        </nav>
      )}
    </>
  );
}
