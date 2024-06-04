import React, { ReactNode } from "react";

export default function ErrorBox({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: Function;
}) {
  //   if (!children) return null;
  return (
    <div
      className={`flex gap-2 items-start font-sm border px-2 rounded-lg ${
        !children ? "hidden" : ""
      }`}
    >
      <div className="font-bold">Error:</div>
      <div className="text-red-500  font-medium w-full">{children}</div>
      <div
        className="hover:bg-black hover:text-white px-2 rounded-lg cursor-pointer select-none"
        onClick={() => {
          onClick();
        }}
      >
        x
      </div>
    </div>
  );
}
