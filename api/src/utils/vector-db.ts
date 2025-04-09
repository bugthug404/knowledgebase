import mongoose from "mongoose";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { appConfig } from "../app-config";
import { Ollama } from "@langchain/community/llms/ollama";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateUUID } from "../modules/cv-ranking/utils";
import { CustomQdrantClient, getCustomStoreClient } from "./custom-qdrant";


export const addToStoreCustom = async (
  collection: string,
  fullText: string
) => {
  try {
    const client = getStoreClient();

    try {
      await client.getCollection(collection);
    } catch (error) {
      if ((error.data.status.error as string).startsWith("Not found:"))
        await client.createCollection(collection, {
          vectors: {
            size: 768,
            distance: "Cosine",
          },
        });
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const texts = await textSplitter.splitText(fullText);

    const embedder = getEmbeder();
    const docEmbeddings = await embedder.embedDocuments(texts);

    if (texts.length !== docEmbeddings.length) {
      throw new Error("docs length is not equal to documents length");
    }

    const points = docEmbeddings.map((d, i) => {
      return {
        id: generateUUID(),
        vector: d,
        payload: {
          content: texts[i],
        },
      };
    });

    console.log("points  -- ", points[0]?.id, points[1]?.id);

    const op = await client.upsert(collection, {
      wait: true,

      points: points,
    });

    console.log("op -- ", op);
  } catch (error) {
    console.error("error adding to store", fullText);
    console.log("error.message - ", error.message);
    throw new Error(error);
  }
};

export const addToStoreUnique = async (
  collection: string,
  fullText: string
) => {
  try {
    const client = getStoreClient();

    try {
      await client.getCollection(collection);
    } catch (error) {
      // if ((error.data.status.error as string).startsWith("Not found:"))
      await client.createCollection(collection, {
        vectors: {
          size: 768,
          distance: "Cosine",
        },
      });
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const texts = await textSplitter.splitText(fullText);

    const embedder = getEmbeder();
    const docEmbeddings = await embedder.embedDocuments(texts);

    if (texts.length !== docEmbeddings.length) {
      throw new Error("docs length is not equal to documents length");
    }

    const promises = docEmbeddings.map(async (d, i) => {
      const document = {
        id: generateUUID(),
        vector: d,
        payload: {
          content: texts[i],
        },
      };
      const existing = await client.search(collection, {
        vector: d,
      });

      if (existing?.[0]?.score > 0.98) {
        return undefined;
      } else {
        return document;
      }
    });

    const points = (await Promise.all(promises)).filter((e) => e !== undefined);

    if (!points?.length) {
      console.log("no points to add");
      console.log("removed - ", promises.length - points.length);
      return;
    }
    console.log("points  -- ", points.length, points[0]?.id, points[1]?.id);

    const op = await client.upsert(collection, {
      wait: true,
      points: points,
    });

    console.log("op -- ", op);
  } catch (error) {
    console.log("error.message - ", error);
    throw new Error(error);
  }
};

export const getDocument = async (collection: string, id: string) => {
  const client = getStoreClient();
  const point = await client.retrieve(collection, { ids: [id] });
  return point;
};

export const listDocuments = async (collection: string, limit = 10, offset = 0) => {
  const client = getStoreClient();
  const points = await client.scroll(collection, {
    limit,
    offset,
    with_payload: true,
    with_vector: false,
  });
  return points;
};

export const updateDocument = async (collection: string, id: string, vector: number[], payload: any) => {
  const client = getStoreClient();
  const point = {
    id,
    vector,
    payload
  };
  const result = await client.upsert(collection, {
    points: [point],
    wait: true
  });
  return result;
};

export const deleteDocument = async (collection: string, id: string) => {
  const client = getStoreClient();
  await client.delete(collection, {
    points: [id],
    wait: true
  });
};

export const deleteCollection = async (collection: string) => {
  const client = getStoreClient();
  await client.deleteCollection(collection);
};

export const searchDocuments = async (collection: string, vector: number[], limit = 5) => {
  const client = getStoreClient();
  const results = await client.search(collection, {
    vector,
    limit,
    with_payload: true
  });
  return results;
};


export const getStoreClient = () => {
  const { qdrantApiKey, qdrantUrl, useLocal } = appConfig;
  return getCustomStoreClient()
}
export function getEmbeder() {
  if (!appConfig.useLocal && !!appConfig.gApiKey) {
    return new GoogleGenerativeAIEmbeddings({
      model: "models/embedding-001",
      apiKey: appConfig.gApiKey,
    });
  } else {
    return new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: "http://localhost:11434",
    });
  }
}


