import mongoose from "mongoose";
import mysql from "mysql2";
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

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI ?? "");
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export const addToStore = async (collection: string, fullText: string) => {
  const { qdrantApiKey, qdrantUrl, useLocal } = appConfig;

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });

  const docs = await textSplitter.createDocuments([fullText]);

  if (!useLocal && !!qdrantApiKey && !!qdrantApiKey) {
    await QdrantVectorStore.fromDocuments(docs, getEmbeder(), {
      collectionName: collection,
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    });
  } else {
    await QdrantVectorStore.fromDocuments(docs, getEmbeder(), {
      collectionName: collection,
      url: "http://localhost:6333",
    });
  }
};

export const getStore = async (collection?: string) => {
  const { qdrantApiKey, qdrantUrl, useLocal } = appConfig;
  if (!useLocal && !!qdrantApiKey && !!qdrantApiKey) {
    return await QdrantVectorStore.fromExistingCollection(getEmbeder(), {
      url: qdrantUrl,
      apiKey: qdrantApiKey,
      collectionName: collection,
    });
  } else {
    return await QdrantVectorStore.fromExistingCollection(getEmbeder(), {
      url: "http://localhost:6333",
      collectionName: collection,
    });
  }
};

export const getStoreClient = () => {
  const { qdrantApiKey, qdrantUrl, useLocal } = appConfig;
  console.log("useLocal", typeof useLocal, !useLocal);
  if (!useLocal && !!qdrantApiKey && !!qdrantApiKey) {
    return new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    });
  } else {
    return new QdrantClient({
      url: "http://localhost:6333",
    });
  }
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

export function getLLM() {
  if (!appConfig.useLocal && !!appConfig.gApiKey) {
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
