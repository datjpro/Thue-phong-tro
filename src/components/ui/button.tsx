import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 text-base font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-la text-la-tren hover:opacity-90",
        secondary: "border border-suong bg-mat text-muc hover:bg-giay",
        ghost: "text-muc hover:bg-suong/60",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: { default: "", sm: "min-h-11 px-3 text-sm", icon: "w-11 px-0" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
