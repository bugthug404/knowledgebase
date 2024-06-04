import React from "react";

export default function Skeleton() {
  return (
    <div role="status" className="max-w-sm animate-pulse my-2">
      <div className="h-2 bg-red-950/30 rounded-full  max-w-[360px] mb-2.5 "></div>
      <div className="h-2 bg-red-950/20 rounded-full  mb-2.5"></div>
      <div className="h-2 bg-red-950/10 rounded-full  max-w-[330px] mb-2.5"></div>
      <div className="h-2 bg-red-900/10 rounded-full  max-w-[300px] mb-2.5"></div>
      <div className="h-2 bg-red-800/5 rounded-full  max-w-[360px]"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
