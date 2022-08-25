import { IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ReactNode } from "react";

const themes = {
  gray: "bg-neutral-200/75 rounded-5xl",
};

export default function Content({
  title,
  icon,
  theme = "gray",
  children,
}: {
  title: string;
  icon: IconDefinition;
  theme?: keyof typeof themes;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "grow max-h-[75vh] p-6 w-5/6 overflow-hidden flex flex-col items-center justify-center",
        themes[theme],
      )}
    >
      <div className="">
        <FontAwesomeIcon icon={icon} className={clsx("w-[5rem] h-[5rem]")} />
        <h1 className="hl-4xl my-7">{title}</h1>
        <div className="text-xl max-w-prose">{children}</div>
      </div>
    </div>
  );
}
