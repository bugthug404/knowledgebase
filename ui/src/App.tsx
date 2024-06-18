import { useState, useLayoutEffect } from "react";
import Button from "./pages/component/button";
import Document from "./pages/document";
import Website from "./pages/website";
import { twMerge } from "tailwind-merge";
import { RouteMaker } from "./pages/router/routes";
import { useNavigate, Navigate } from "react-router-dom";
import { apiRequest } from "./utils";
import ErrorBox from "./pages/error-box";
import Chat from "./pages/chat";
import CVRank from "./pages/cv-upload";
import CVSearchList from "./pages/cv-search-list";

function App() {
  const path = window.location.pathname;
  const nav = useNavigate();

  const [colList, setColList] = useState<{ name: string }[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [askCol, setAskCol] = useState<string>("");

  if (path === "/") {
    return <Navigate to="/chat" />;
  }

  function getData() {
    setError(undefined);
    apiRequest({
      path: "/col/list",
      success: " Got it",
      error: "Something went wrong!",
      onSuccess: (res) => {
        const list = res?.data.data;
        setColList(list);
        setAskCol(list[0]?.name);
      },
      onError: (err) => {
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
    "/chat": (
      <Chat
        colList={colList}
        setError={setError}
        askCol={askCol}
        setAskCol={setAskCol}
      />
    ),
    "/website": (
      <Website colList={colList} setError={setError} getColList={getData} />
    ),
    "/document": (
      <Document colList={colList} setError={setError} getColList={getData} />
    ),
    // "/cv-rank": (
    //   <>
    //     <CVRank colList={colList} setError={setError} getColList={getData} />
    //   </>
    // ),
  };

  return (
    <div className="max-w-2xl flex flex-col gap-4 mx-auto">
      <div className="flex justify-center gap-4">
        {Object.keys(routes).map((v, i) => {
          return (
            <Button
              onClick={() => nav(v)}
              className={twMerge(
                "rounded-t-0 rounded-none rounded-b-lg px-3 py-1 text-xs",
                path === v && " bg-black text-blue-50 "
              )}
              key={v}
            >
              {v.replace("/", "")}
            </Button>
          );
        })}
      </div>
      <ErrorBox children={error} onClick={() => setError(undefined)} />

      <RouteMaker routes={routes} />

      {/* <index.component /> */}
    </div>
  );
}

export default App;
