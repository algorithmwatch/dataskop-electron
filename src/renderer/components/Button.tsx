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
  text: `
    text-east-blue-700
    hover:text-east-blue-700/80
  `,
  outline: `
    text-east-blue-700
    hover:text-east-blue-700/80
    border-2 border-east-blue-700
  `,
  // bg-clip-text text-transparent bg-gradient-to-r from-turquoise-600 to-sky-600
};

const sizes = {
  xs: "px-3 h-8 text-xs rounded",
  sm: "px-3.5 h-10 text-sm rounded-md",
  md: "px-5 h-[3.75rem] text-xl rounded-md",
  lg: "px-6 h-16 text-2xl rounded-lg",
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
} & IconProps;

export type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: "button";
  };

type ButtonAsExternal = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    as: "externalLink";
  };

export type ButtonProps = ButtonAsButton | ButtonAsExternal;

export const Button = forwardRef(
  (
    {
      theme = "primary",
      size = "md",
      startIcon,
      endIcon,
      isLoading = false,
      children,
      className,
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
        {children && <span className="max-w-lg truncate">{children}</span>}
        {endIcon && (
          <FontAwesomeIcon
            icon={endIcon}
            aria-hidden="true"
            className="shrink-0"
          />
        )}
      </>
    );
    const classNames = clsx(
      "min-w-0 inline-flex items-center justify-center font-bold",
      "focus:outline-none hover:no-underline",
      "disabled:opacity-70 disabled:cursor-not-allowed",
      themes[theme],
      sizes[size],
      { [iconSizes[size]]: isLoading || startIcon || endIcon },
      className,
    );

    if (props.as === "externalLink") {
      const { as, target, rel, ...rest } = props;
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

    const { as, type, ...rest } = props;
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
