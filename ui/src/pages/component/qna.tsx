import React from "react";
import Skeleton from "./skeleton";
import { QNAProps } from "./props";

export default function Qna({ list }: { list: QNAProps[] }) {
  return (
    <div className="bg-white mt-4 py-2 rounded-lg min-h-52 flex flex-col gap-4">
      {list.map((v, i) => (
        <div
          className={`px-2 flex flex-col ${i !== 0 && "border-t-2"} pt-2`}
          key={v.question + i}
        >
          <div className="font-bold bg-blue-100 px-2 rounded-t-md">
            {v.question}
          </div>{" "}
          <div className="bg-blue-50 px-2 rounded-b-md">
            {v.answer ? <div>{v.answer}</div> : <Skeleton />}
          </div>
        </div>
      ))}
    </div>
  );
}
