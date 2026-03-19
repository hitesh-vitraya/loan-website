import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

import { cn } from "../../lib/cn";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-disabled"?: boolean;
};

const baseClassName = "button";

export function Button({
  children,
  href = "#cta",
  className,
  onClick,
  "aria-disabled": ariaDisabled
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(baseClassName, className)}
      onClick={onClick}
      aria-disabled={ariaDisabled}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="buttonArrow">
        {">>"}
      </span>
    </Link>
  );
}
