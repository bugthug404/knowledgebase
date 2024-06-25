import React, { useState } from "react";
// import { QNAProps } from './App';
import { apiRequest } from "../utils";
import toast from "react-hot-toast";
import FileSelect from "./component/file-select";
import Button from "./component/button";
import CVSearchList from "./cv-search-list";

export default function CVRank({
  colList,
  setError,
  getColList,
}: {
  colList: { name: string }[] | null;
  setError: Function;
  getColList: Function;
}) {
  const [file, setFile] = useState<FileList | null>(null);
  const [collection, setCollection] = useState<string>("");
  const [fType, setType] = useState(".pdf");
  const [askCol, setAskCol] = useState<string>("");

  async function handleUploadPdf() {
    setError(undefined);
    if (!collection) return toast.error("Please enter a collection name");

    console.log("file --- ", file);

    if (file?.[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(file?.[0]);

      console.log("reader --- ", reader);

      reader.onload = (event) => {
        const data = event.target?.result as BinaryData;
        // apiRequest({
        //   path: "/cvr/add",
        //   method: "POST",
        //   data: { data, collectionName: collection, fileType: fType },
        //   success: "Your PDF ready to serve 🎉🎊🥳",
        //   error: "Something went wrong!",
        //   onSuccess: () => getColList,
        //   onError: (err) => {
        //     console.log(err);
        //     setError(err);
        //   },
        // });
        // handleUploadPdf(fileData as BinaryData);
      };
    } else {
      toast.error("Please select a file");
      return;
    }
  }

  return (
    <div className=" flex flex-col gap-4 items-center ">
      <div className="p-4 bg-blue-50 rounded-3xl  w-full  gap-2">
        <div className="flex items-end justify-between gap-4">
          <FileSelect
            setFile={setFile}
            accept={fType}
            multiple
            label={
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <div className="flex">
                    <div>Select collections</div>
                    <div className="ml-2">
                      <select
                        //  options={collections}
                        className="w-32 border outline-none rounded-lg"
                        value={collection}
                        onChange={(e) => setCollection(e.currentTarget?.value)}
                      >
                        <option value="">create new</option>
                        {colList?.map((v) => (
                          <option value={v.name} key={v.name}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-sm">Collection Name :</div>
                  <input
                    type="text"
                    className="w-36 outline-none px-2 border py-0.5 rounded-lg"
                    placeholder="eg. sample.pdf"
                    value={collection}
                    onChange={(e) => setCollection(e.currentTarget.value)}
                  />
                  <div className="flex">
                    <div>Document type</div>
                    <div className="ml-2">
                      <select
                        //  options={collections}
                        className="w-20 border outline-none rounded-lg"
                        value={fType}
                        onChange={(e) => setType(e.currentTarget?.value)}
                      >
                        {[
                          ".txt",
                          ".docx",
                          ".pptx",
                          ".xlsx",
                          ".odt",
                          ".odp",
                          ".ods",
                          ".pdf",
                        ]?.map((v) => (
                          <option value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="font-bold">Select your PDF file</div>
              </div>
            }
          />
          <Button
            onClick={() => {
              handleUploadPdf();
            }}
            className="mb-[14px]"
          >
            Upload
          </Button>
        </div>
      </div>
      <CVSearchList
        colList={colList}
        setError={setError}
        askCol={askCol}
        setAskCol={setAskCol}
      />
    </div>
  );
}
