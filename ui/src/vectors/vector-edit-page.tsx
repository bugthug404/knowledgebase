import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Input from "../input";
import EasyButton from "../pages/component/button";
import { useParams, useNavigate } from "react-router-dom";

export default function VectorEditPage({
  colList,
  setAskCol,
}: {
  colList?: { name: string }[];
  setAskCol: Function;
}) {
  const [collection, setCollection] = useState<string | undefined>();
  const [document, setDocument] = useState<string>(
    "what is sacred ohms? \n Sacred Ohms is an exclusive, members-only, integrated booking platform that revolutionizes the wellness experience by seamlessly connecting vetted Retreat Leaders to energetically aligned properties, fostering a harmonious booking experience for all: Reducing friction for Retreat Leaders, Growing revenue for Ohm Owners, Discovering new locations, Searchable niche-focused amenities, Programming designed to elevate the retreat experience all, save user provided data to addToSessionMemory."
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { vid, cid } = useParams();

  useEffect(() => {
    if (cid) {
      setCollection(cid);
      setAskCol(cid);
    } else if (colList?.length) {
      setCollection(colList[0].name);
    }
  }, [cid, colList]);

  useEffect(() => {
    if (vid && collection) {
      fetchDocument();
    }
  }, [vid, collection]);

  async function fetchDocument() {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${(import.meta as any).env.VITE_APP_API}/vector/get`,
        {
          collectionid: collection,
          ids: [vid],
        }
      );
      setDocument(
        JSON.stringify(data?.data?.result?.[0]?.payload?.content || {})
          .replace(/\\n/g, "\n")
          .replace(/^"|"$/g, "")
      );
    } catch (error) {
      console.error("Error fetching document:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      await axios.post(`${(import.meta as any).env.VITE_APP_API}/vector/add`, {
        collectionid: collection,
        textData: document,
      });
      navigate(`/vectors/${collection}`);
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    setLoading(true);
    try {
      await axios.put(
        `${(import.meta as any).env.VITE_APP_API}/vector/update`,
        {
          collectionid: collection,
          updateData: document,
          id: vid,
        }
      );
      // navigate(`/vectors/${collection}`);
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-blue-50 rounded-3xl w-full gap-2">
      <div className="pb-2">
        <label htmlFor="selectllm">Collection: </label>
        <select
          name="selectllm"
          onChange={(e) => {
            setCollection(e.target.value);
            setAskCol(e.target.value);
          }}
          value={collection}
          className="px-2 py-1 rounded-lg outline-none"
          disabled={!!cid}
        >
          {colList?.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              {vid ? "Edit Document" : "Add New Document"}
            </h2>
            <textarea
              className="w-full h-48 p-2 border rounded"
              value={document}
              onChange={(e) => {
                try {
                  setDocument(e.target.value);
                } catch (error) {
                  // Handle invalid JSON
                }
              }}
            />
            <div className="mt-4 flex justify-end">
              <EasyButton onClick={vid ? handleUpdate : handleSave}>
                {vid ? "Update" : "Add"}
              </EasyButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
