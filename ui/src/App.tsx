import { useState, useRef, useLayoutEffect } from "react";
import Button from "./pages/component/button";
import Document from "./pages/document";
import Website from "./pages/website";
import { twMerge } from "tailwind-merge";
import { RouteMaker } from "./pages/router/routes";
import { useNavigate, Navigate } from "react-router-dom";
import { QNAProps } from "./pages/component/props";
import Input from "./input";
import toast from "react-hot-toast";
import { apiRequest, llmList } from "./utils";
import Qna from "./pages/component/qna";
import ErrorBox from "./pages/error-box";

function App() {
  const path = window.location.pathname;
  const nav = useNavigate();
  const [qnaList, setQnaList] = useState<QNAProps[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [colList, setColList] = useState<{ name: string }[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [askCol, setAskCol] = useState<string>("");

  if (path === "/") {
    return <Navigate to="/website" />;
  }

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

  function getData() {
    setError(undefined);
    apiRequest({
      path: "/col/list",
      success: " Got it",
      error: "Something went wrong!",
      onSuccess: (res) => {
        const list = res?.data.data;
        console.log(list);
        setColList(list);
        console.log(list);
        setAskCol(list[0]?.name);
      },
      onError: (err) => {
        console.log(err);
        setError(err);
      },
    });
  }

  useLayoutEffect(() => {
    if (colList === null && !error) {
      getData();
    }
  });

  const routes = {
    "/website": (
      <Website colList={colList} setError={setError} getColList={getData} />
    ),
    "/document": (
      <Document colList={colList} setError={setError} getColList={getData} />
    ),
  };

  return (
    <div className="max-w-3xl flex flex-col gap-4 mx-auto">
      <div className="flex justify-center gap-4">
        {Object.keys(routes).map((v, i) => {
          return (
            <Button
              onClick={() => nav(v)}
              className={twMerge(
                "rounded-t-0 rounded-none rounded-b-lg px-3 py-1 text-xs",
                path === v && " bg-black text-blue-50 "
              )}
            >
              {v.replace("/", "")}
            </Button>
          );
        })}
      </div>
      <ErrorBox children={error} onClick={() => setError(undefined)} />

      <RouteMaker routes={routes} />
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
      {/* <index.component /> */}
    </div>
  );
}

export default App;
