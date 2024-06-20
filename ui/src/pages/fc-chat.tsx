import React, { useRef, useState } from "react";
import { QNAProps } from "./component/props";
import toast from "react-hot-toast";
import { apiRequest } from "../utils";
import Input from "../input";
import Button from "./component/button";
import Qna from "./component/qna";

export default function FcChat({
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
      path: `/fc/ask?query=${question}&collection=${askCol}`,
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
    <div className=" ">
      <div className=" bg-blue-50 rounded-xl  w-full  gap-2">
        <div className="flex gap-4 p-4">
          <Input
            inputRef={inputRef}
            onEnter={handleAsk}
            placeholder="Ask me anything"
          />
          <Button onClick={() => handleAsk()}>Ask</Button>
        </div>
      </div>
      {qnaList.length ? (
        <Qna list={qnaList} />
      ) : (
        <div className="p-4 bg-blue-50 mt-4 rounded-lg h-52 text-center pt-24">
          Ask your first question
        </div>
      )}
    </div>
  );
}
