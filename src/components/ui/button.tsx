import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap border text-[12.8px] font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:bg-primary/95",
        destructive: "border-destructive bg-destructive-surface text-destructive hover:bg-destructive-surface/90",
        outline: "border-border bg-card text-foreground hover:border-primary hover:text-primary",
        secondary: "border-border bg-secondary text-secondary-foreground hover:border-primary/40 hover:text-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-card hover:border-border hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[39.06px] px-[12.8px] py-[10.24px]",
        sm: "h-[31.25px] px-[10.24px] text-[10.24px]",
        lg: "h-[48.83px] px-[16px] text-[16px]",
        icon: "h-[39.06px] w-[39.06px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
