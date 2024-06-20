import React from "react";
import Skeleton from "./skeleton";
import { QNAProps } from "./props";
import Markdown from "react-markdown";
import remarkToc from "remark-toc";
import rehypeRaw from "rehype-raw";

export default function Qna({ list }: { list: QNAProps[] }) {
  return (
    <div className="bg-white mt-2 py-2  min-h-52 flex flex-col gap-4 pb-10">
      {list.map((v, i) => (
        <div
          className={`px- 2 flex flex-col ${i !== 0 && "border-t-2"} pt-2`}
          key={v.question + i}
        >
          <div className="font-bold bg-blue-100 px-2 rounded-t-md">
            {v.question}
          </div>{" "}
          <div className="bg-blue-50 px-3 rounded-b-md">
            {v.answer ? (
              <Markdown
                remarkPlugins={[remarkToc]}
                rehypePlugins={[rehypeRaw]}
                className={"py-2"}
              >
                {v.answer ?? "# hi"}
              </Markdown>
            ) : (
              <Skeleton />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
