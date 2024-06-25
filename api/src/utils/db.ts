import mongoose from "mongoose";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { appConfig } from "./app-config";
import { Ollama } from "@langchain/community/llms/ollama";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateUUID } from "../modules/cv-ranking/utils";

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI ?? "");
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export const addToStore = async (collection: string, fullText: string) => {
  try {
    const { qdrantApiKey, qdrantUrl, useLocal } = appConfig;
    if (!qdrantUrl) {
      throw new Error("vector store url is required! please check your config");
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const docs = await textSplitter.createDocuments([fullText]);

    const op = await QdrantVectorStore.fromDocuments(docs, getEmbeder(), {
      collectionName: collection,
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    });
    console.log("operation result -- ", op);
  } catch (error) {
    throw new Error(error);
  }
};

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
        id: i,
        vector: d,
        payload: {
          content: texts[i],
        },
      };
    });

    console.log("points -- ", points[0].id, points[1].id);

    const op = await client.upsert(collection, {
      wait: true,

      points: points,
    });
  } catch (error) {
    console.error("error adding to store", error);
    throw new Error(error);
  }
};

export const getStore = async (collection?: string) => {
  const { qdrantApiKey, qdrantUrl, useLocal } = appConfig;
  // if (!useLocal && !!qdrantApiKey && !!qdrantApiKey) {
  return await QdrantVectorStore.fromExistingCollection(getEmbeder(), {
    url: qdrantUrl,
    apiKey: qdrantApiKey,
    collectionName: collection,
  });
};

export const getStoreClient = () => {
  const { qdrantApiKey, qdrantUrl, useLocal } = appConfig;
  return new QdrantClient({
    url: qdrantUrl, // "http://localhost:6333",
    apiKey: qdrantApiKey,
  });
};

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

export function getLLM(useGemini?: boolean) {
  if (
    (!appConfig.useLocal && !!appConfig.gApiKey) ||
    (useGemini && !!appConfig.gApiKey)
  ) {
    return new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      maxOutputTokens: 2048,
      apiKey: appConfig.gApiKey,
    });
  } else {
    return new Ollama({
      baseUrl: "http://localhost:11434",
      model: "gemma:2b" as string,
    });
  }
}
