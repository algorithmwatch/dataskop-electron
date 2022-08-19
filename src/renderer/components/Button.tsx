import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faLoader } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { forwardRef } from "react";

// credits: https://dev.to/frehner/polymorphic-button-component-in-typescript-c28

const themes = {
  primary: `
    text-white
    bg-gradient-to-br from-turquoise-600 to-sky-600
    shadow-md shadow-sky-600/20
    hover:from-turquoise-600/90 hover:to-sky-600/90
    `,
};

const sizes = {
  xs: "px-3 py-2.5 text-xs rounded",
  sm: "px-3.5 py-3 text-sm rounded-md",
  md: "px-5 py-4 text-xl rounded-md",
  lg: "px-6 py-5 text-2xl rounded-lg",
};

const iconSizes = {
  xs: "space-x-1.5",
  sm: "space-x-2",
  md: "space-x-2.5",
  lg: "space-x-2.5",
};

type IconProps =
  | { startIcon: IconDefinition; endIcon?: never }
  | { endIcon: IconDefinition; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined };

type BaseProps = {
  children: React.ReactNode;
  theme?: keyof typeof themes;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  grow?: true | "onMobile";
} & IconProps;

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: "button";
  };

type ButtonAsExternal = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    as: "externalLink";
  };

type ButtonProps = ButtonAsButton | ButtonAsExternal;

export const Button = forwardRef(
  (
    {
      theme = "primary",
      size = "md",
      startIcon,
      endIcon,
      isLoading = false,
      grow,
      children,
      ...props
    }: ButtonProps,
    ref: any,
  ) => {
    const content = (
      <>
        {isLoading && (
          <FontAwesomeIcon
            icon={faLoader}
            aria-hidden="true"
            className="shrink-0"
          />
        )}
        {!isLoading && startIcon && (
          <FontAwesomeIcon
            icon={startIcon}
            aria-hidden="true"
            className="shrink-0"
          />
        )}
        {children !== "" && (
          <span className="max-w-xs truncate sm:max-w-[260px]">{children}</span>
        )}
        {!isLoading && endIcon && (
          <FontAwesomeIcon
            icon={endIcon}
            aria-hidden="true"
            className="shrink-0"
          />
        )}
      </>
    );
    const classNames = clsx(
      "min-w-0 inline-flex items-center justify-center font-bold transition ease-out",
      "focus:outline-none hover:no-underline",
      "disabled:opacity-70 disabled:cursor-not-allowed",
      themes[theme],
      sizes[size],
      { grow: grow === true },
      { "grow sm:grow-0": grow === "onMobile" },
      { [iconSizes[size]]: isLoading || startIcon || endIcon },
    );

    if (props.as === "externalLink") {
      const { as, className, target, rel, ...rest } = props;
      return (
        <a
          ref={ref}
          className={classNames}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}
        >
          {content}
        </a>
      );
    }

    const { as, type, className, ...rest } = props;
    return (
      <button
        ref={ref}
        // eslint-disable-next-line react/button-has-type
        type={type || "button"}
        className={classNames}
        {...rest}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
