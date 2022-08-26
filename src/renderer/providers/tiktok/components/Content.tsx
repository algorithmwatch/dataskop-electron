import { IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ReactNode } from "react";

const themes = {
  gray: "bg-neutral-200/75 rounded-5xl",
  transparent: "",
};

const sizes = {
  sm: {
    parent: "p-6",
    icon: "w-[4rem] h-[4rem] mt-8",
    title: "hl-3xl my-6",
    content: "text-base",
  },
  md: {
    parent: "p-6",
    icon: "w-[5rem] h-[5rem] mt-24",
    title: "hl-4xl my-7",
    content: "text-xl",
  },
};

export default function Content({
  title,
  icon,
  theme = "gray",
  size = "md",
  children,
}: {
  title: string;
  icon: IconDefinition;
  size?: keyof typeof sizes;
  theme?: keyof typeof themes;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "grow max-h-[75vh] w-5/6 overflow-hidden flex flex-col items-center justify-start",
        themes[theme],
        sizes[size].parent,
      )}
    >
      <FontAwesomeIcon icon={icon} className={sizes[size].icon} />
      <h1 className={sizes[size].title}>{title}</h1>
      <div
        className={clsx("max-w-prose grow flex flex-col", sizes[size].content)}
      >
        {children}
      </div>
    </div>
  );
}
