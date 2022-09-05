import { IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { ReactNode } from "react";

const themes = {
  gray: "rounded-5xl bg-neutral-200/70",
  tiktokAnimated: "rounded-5xl animated-gradient-tiktok-light",
  tiktokLight: "rounded-5xl bg-gradient-to-br from-[#B5FFFD] to-[#FFB8CE]",
  transparent: "",
};

const sizes = {
  sm: {
    parent: "p-6",
    icon: "w-[4rem] h-[4rem]",
    title: "hl-3xl my-6",
    content: "text-base",
  },
  md: {
    parent: "p-6",
    icon: "w-[4rem] h-[4rem] xl:w-[5rem] xl:h-[5rem] -mt-10",
    title: "hl-4xl my-7 xl:hl-5xl",
    content: "text-xl",
  },
};

export default function Content({
  title,
  icon,
  iconSpinning = false,
  theme = "gray",
  size = "md",
  children,
}: {
  title: string;
  icon?: IconDefinition;
  iconSpinning?: boolean;
  size?: keyof typeof sizes;
  theme?: keyof typeof themes;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "grow max-h-[75vh] w-5/6 overflow-hidden flex flex-col items-center justify-center",
        themes[theme],
        sizes[size].parent,
      )}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className={sizes[size].icon}
          spin={iconSpinning}
        />
      )}
      <h1 className={sizes[size].title}>{title}</h1>
      <div className={clsx("max-w-prose flex flex-col", sizes[size].content)}>
        {children}
      </div>
    </div>
  );
}
