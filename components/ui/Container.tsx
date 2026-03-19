import { ElementType, ReactNode } from "react";

import { cn } from "../../lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function Container({
  children,
  className,
  as: Tag = "div"
}: ContainerProps) {
  return <Tag className={cn("container", className)}>{children}</Tag>;
}
