import React, { useRef, useState } from "react";
import { apiRequest } from "../utils";
import toast from "react-hot-toast";
import Button from "./component/button";
import Input from "../input";

export default function Website({
  colList,
  setError,
  getColList,
}: {
  colList: { name: string }[] | null;
  setError: Function;
  getColList: Function;
}) {
  const urlRef = useRef<HTMLInputElement>(null);
  const [collection, setCollection] = useState<string>("");

  async function handleWebsiteUpload() {
    setError(undefined);
    if (!collection) return toast.error("Please select a collection");
    if (!urlRef.current?.value)
      return toast.error("Please enter a website url");
    const data = { url: urlRef.current.value };

    apiRequest({
      path: "/web/add",
      method: "POST",
      data: { ...data, collectionName: collection },
      success: "Your website ready to serve 🎉🎊🥳",
      error: "Something went wrong!",
      onSuccess: () => getColList(),
      onError: (err) => {
        console.log(err);
        setError(err);
      },
    });
    // handleUploadPdf(fileData as BinaryData);
  }

  return (
    <div className=" flex flex-col gap-4 items-center">
      <div className="p-4 bg-gray-100 rounded-3xl  w-full flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 text-sm">
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
        </div>
        <div className="font-bold text-sm">Website URL</div>
        <div className="flex items-center justify-between gap-4">
          <Input
            inputRef={urlRef}
            onEnter={() => handleWebsiteUpload()}
            placeholder="Enter url"
            className="py-1.5"
          />
          <Button
            onClick={() => {
              handleWebsiteUpload();
            }}
            className=""
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
