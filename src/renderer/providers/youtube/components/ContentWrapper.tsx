import clsx from "clsx";
import { ReactNode } from "react";

const ContentWrapper = ({
  centerY,
  children,
}: {
  centerY?: boolean;
  children: ReactNode;
}) => {
  return (
    <div
      className={clsx(
        "mx-auto max-w-prose flex flex-col justify-center",
        centerY ? "h-full" : "my-10",
      )}
    >
      <div>{children}</div>
    </div>
  );
};

export default ContentWrapper;
