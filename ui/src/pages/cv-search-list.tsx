import React, { useRef, useState } from "react";
import { QNAProps } from "./component/props";
import toast from "react-hot-toast";
import { apiRequest } from "../utils";
import Input from "../input";
import Button from "./component/button";
import Qna from "./component/qna";

export default function CVSearchList({
  colList,
  setError,
  askCol,
  setAskCol,
}: {
  colList: { name: string }[] | null;
  setError: Function;
  askCol: string;
  setAskCol: Function;
}) {
  const [qnaList, setQnaList] = useState<QNAProps[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAsk() {
    setError(undefined);
    const question = inputRef.current?.value;
    if (!question) return toast("Please enter your question!");
    if (!askCol) return toast("Please select a collection name");

    // let m = model.replace("", "--");
    setQnaList([
      {
        question: question,
      },
      ...qnaList,
    ]);

    let q = inputRef.current.value;

    apiRequest({
      path: `/doc/ask?query=${question}&collection=${askCol}`,
      success: "success",
      error: "Something went wrong!",
      onSuccess: (res) => {
        console.log("result -- ", res);
        const data = res.data.data;
        setQnaList([
          {
            answer: data,
            question: q,
          },
          ...qnaList,
        ]);
      },
      onError: (err) => {
        console.log(err);
        setError(err);
      },
      finaly() {
        if (inputRef.current) inputRef.current.value = "";
      },
    });
  }

  return (
    <div className="p-4 bg-gray-100 rounded-3xl  w-full  gap-2">
      <div className="pb-2">
        <label htmlFor="selectllm">Choose Collection : </label>
        <select
          name="selectllm"
          id=""
          onChange={(e) => setAskCol(e.target.value)}
          value={askCol}
          className="px-2 py-1 rounded-lg outline-none"
        >
          {colList?.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-4">
        <Input
          inputRef={inputRef}
          onEnter={handleAsk}
          placeholder="Ask a question from the book"
        />
        <Button onClick={() => handleAsk()}>Ask</Button>
      </div>
      {qnaList.length ? (
        <Qna list={qnaList} />
      ) : (
        <div className="p-4 bg-white mt-4 rounded-lg h-52 text-center pt-24">
          Ask your first question
        </div>
      )}
    </div>
  );
}
