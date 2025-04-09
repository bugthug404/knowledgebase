import React from "react";
import { twMerge } from "tailwind-merge";

export default function Input({
  inputRef,
  onEnter,
  placeholder,
  type = "text",
  className,
  defaultValue,
}: {
  inputRef: any;
  onEnter?: () => void;
  placeholder?: string;
  type?: string;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <input
      type={type}
      ref={inputRef}
      placeholder={placeholder}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onEnter?.();
        }
      }}
      defaultValue={defaultValue}
      className={twMerge(
        " w-full rounded-lg px-2 outline-none focus-visible:shadow-md",
        className
      )}
    />
  );
}
