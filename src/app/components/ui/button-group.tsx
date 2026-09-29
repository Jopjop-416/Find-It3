import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonGroupVariants = cva(
  "inline-flex items-center justify-center [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child)]:-ml-px [&>*:hover]:z-10 [&>*:focus-visible]:z-10",
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical:
          "flex-col [&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:-ml-0",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
  asChild?: boolean;
}

function ButtonGroup({
  className,
  orientation,
  asChild = false,
  ...props
}: ButtonGroupProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="button-group"
      role="group"
      className={cn(buttonGroupVariants({ orientation, className }))}
      {...props}
    />
  );
}

export { ButtonGroup, buttonGroupVariants };
