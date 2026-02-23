"use client";

import { ButtonHTMLAttributes } from "react";

export type SlideButtonVariant = "primary" | "ghost" | "disabled";

export interface SlideButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SlideButtonVariant;
  children: React.ReactNode;
}

export function SlideButton({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: SlideButtonProps) {
  const isDisabled = variant === "disabled" || disabled;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`
        rounded-[24px] px-7 py-2.5 text-base font-medium
        transition-all duration-200 ease-out
        active:scale-[0.97]
        ${className}
        ${
          variant === "primary"
            ? "border-2 border-black bg-transparent text-black hover:bg-black hover:text-white"
            : variant === "ghost"
              ? "border border-transparent bg-transparent text-black hover:bg-black/10"
              : "cursor-not-allowed border border-gray-500 bg-transparent text-gray-500"
        }
      `}
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      {...props}
    >
      {children}
    </button>
  );
}
