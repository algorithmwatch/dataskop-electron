import classNames from "classnames";
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
      className={classNames(
        "mx-auto max-w-prose flex flex-col justify-center",
        centerY ? "h-full" : "my-10",
      )}
    >
      <div>{children}</div>
    </div>
  );
};

export default ContentWrapper;
