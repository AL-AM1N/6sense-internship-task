import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-black hover:bg-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-600",
      },

      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = ({
  variant,
  size,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`${buttonVariants({ variant, size })} ${className || ""}`}
      {...props}
    />
  );
};

export default Button;