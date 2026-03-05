import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({ variant = "primary", className, ...props }) => {
  const baseStyle = "px-4 py-2 rounded font-semibold transition-colors";
  const variantStyle = variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300";
  return <button className={clsx(baseStyle, variantStyle, className)} {...props} />;
};

export default Button;