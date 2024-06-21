import {
  HarmBlockThreshold,
  HarmCategory,
  SafetySetting,
} from "@google/generative-ai";
import { getEmbeder, getStoreClient } from "./db";

export async function searchDatabase(
  collectionid: string,
  userQuery: string,
  keywords?: string
) {
  if (!userQuery || !collectionid) {
    return { error: "Missing parameters" };
  }

  const client = getStoreClient();
  const embeder = getEmbeder();

  const queryEmbeddings = await embeder.embedQuery(userQuery + " " + keywords);
  const documents = await client.search(collectionid, {
    vector: queryEmbeddings,
  });

  const docs = documents.map((doc) =>
    (doc.payload.content as string).replace(/\s+/g, " ")
  );
  return {
    documents: docs,
  };
}

export const searchDatabaseFD = {
  name: "searchDatabase",
  parameters: {
    type: "OBJECT",
    description: "Search vector database for the information",
    properties: {
      collectionid: {
        type: "STRING",
        description: "The collection name to get data from.",
      },
      userQuery: {
        type: "STRING",
        description: "The query from user.",
      },
      keyword: {
        type: "STRING",
        description:
          "Additional keywords to include with query for better results. e.g. userQuery: can i use apple pay? additional keywords 'payment', 'purchase'",
      },
    },
    required: ["collectionid", "userQuery"],
  },
};

export async function addToSessionMemory(
  keyName: string,
  value: string,
  callback: (query: string, ans: string) => void
) {
  console.log("sessionMemory db -- ", keyName, value);
  if (!keyName || !value) {
    return { error: "Missing parameters" };
  }

  callback(keyName, value);

  return {
    message: "understood",
  };
}

export const addToSessionMemoryFD = {
  name: "addToSessionMemory",
  parameters: {
    type: "OBJECT",
    description: "To remember information for a session.",
    properties: {
      keyName: {
        type: "STRING",
        description: "The information key name.",
      },
      value: {
        type: "STRING",
        description: "The value to be saved.",
      },
    },
    required: ["keyName", "value"],
  },
};

export const allowPersonalInfo: SafetySetting = {
  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  threshold: HarmBlockThreshold.BLOCK_NONE,
};
