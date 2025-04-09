import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Input from "../input";
import EasyButton from "../pages/component/button";
import { useNavigate } from "react-router-dom";
import { BiSolidEditAlt } from "react-icons/bi";

export default function VecotorPage({
  colList,
  setAskCol,
}: {
  colList?: { name: string }[];
  setAskCol: Function;
}) {
  const [collection, setCollection] = useState<string | undefined>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  async function fetchItems() {
    if (!collection) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${
          (import.meta as any).env.VITE_APP_API
        }/vector/list?collectionid=${collection}`,
        {
          limit: 20,
          offset: 0,
          with_payload: true,
          with_vector: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setItems(data.data.result.points || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async () => {
    if (!inputRef.current?.value || !collection) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${
          (import.meta as any).env.VITE_APP_API
        }/vector/search?collectionid=${collection}`,
        {
          userQuery: inputRef.current.value,
          keywords: [],
        }
      );
      setSearchResults(data.data || []);
      setItems([]); // Clear regular items when showing search results
    } catch (error) {
      console.error("Error searching vectors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (colList?.length) {
      setCollection(colList[0].name);
    }
  }, [colList]);

  useEffect(() => {
    fetchItems();
  }, [collection]);

  return (
    <div className="p-4 bg-blue-50 rounded-3xl w-full gap-2">
      <div className="pb-2">
        <div className="flex items-center gap-4">
          <label htmlFor="selectllm">Choose Collection : </label>
          <select
            name="selectllm"
            id=""
            onChange={(e) => {
              setCollection(e.target.value);
              setAskCol(e.target.value);
              setSearchResults([]); // Clear search results on collection change
            }}
            value={collection}
            className="px-2 py-1 rounded-lg outline-none"
          >
            {colList?.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
          <EasyButton
            className=""
            onClick={() => {
              nav(`/vectors/${collection}`);
            }}
          >
            Add New Document
          </EasyButton>
        </div>
        <div className="bg-blue-50 rounded-xl w-full gap-2">
          <div className="flex gap-4 p-4">
            <Input
              inputRef={inputRef}
              onEnter={handleSearch}
              defaultValue="what is sacred ohms?"
              placeholder="Ask me anything"
            />
            <EasyButton onClick={handleSearch}>Search</EasyButton>
            {searchResults.length > 0 && (
              <EasyButton
                onClick={() => {
                  setSearchResults([]);
                  fetchItems();
                }}
              >
                Clear
              </EasyButton>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="mt-4">
          {(searchResults.length > 0 ? searchResults : items).map(
            (item, index) => (
              <div
                key={index}
                onClick={() => {
                  nav("/vectors/" + collection + "/" + item.id);
                }}
                className="p-2 pt-4 group bg-white rounded mb-2 relative cursor-pointer "
              >
                <span className="opacity-55  absolute -right-2 -top-2 p-2 group-hover:bg-gray-200 hover:opacity-100 rounded-full">
                  <BiSolidEditAlt />
                </span>
                <span>
                  {index + 1}: {JSON.stringify(item)}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
