import clsx from "clsx";
import { ReactNode } from "react";

type SlotPosition = "start" | "center" | "end";
export type FooterSlots = {
  [key in SlotPosition]?: ReactNode;
};

export default function WizardLayout({
  className,
  children,
  footerSlots,
}: {
  className?: string;
  children: ReactNode;
  footerSlots?: FooterSlots;
}) {
  return (
    <>
      <div
        className={clsx(
          "grow min-h-0 h-full w-full max-w-full mx-auto flex flex-col items-center justify-center",
          className,
        )}
      >
        {children}
      </div>
      {footerSlots && (
        <nav className="h-24 shrink-0 px-6 grid grid-cols-3">
          <div className="flex items-start justify-start space-x-2">
            {footerSlots.start}
          </div>
          <div className="flex items-start justify-center space-x-2">
            {footerSlots.center}
          </div>
          <div className="flex items-start justify-end space-x-2">
            {footerSlots.end}
          </div>
        </nav>
      )}
    </>
  );
}
