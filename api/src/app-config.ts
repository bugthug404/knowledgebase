import dotenv from "dotenv";
dotenv.config();

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const QDRANT_API_URL = process.env.QDRANT_API_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const USE_LOCAL_RESOURCES = process.env.USE_LOCAL_RESOURCES;
const MONGODB_URI = process.env.MONGODB_URI;

export const appConfig = {
  weaviateApiKey: undefined,
  weaviateUrl: "http://localhost:8080",
  gApiKey: GOOGLE_AI_API_KEY ?? "AIzaSyBmtXNOUfnlMZ320qlE-TkVdsAMeH8cxec",
  // llmUrl: "https://llm.217-160-150-142.plesk.page",
  llmUrl: "http://localhost:11434",
  useLocal: USE_LOCAL_RESOURCES,
  qdrantUrl:
    // "http://localhost:6333",
    QDRANT_API_URL ?? "https://qdrant.217-160-150-142.plesk.page",
  qdrantApiKey:
    QDRANT_API_KEY ?? "ak_b7883b18b58e87ba9ffbf752798aab56f4da7962dac3ed08acf96d30f7701a68",
  mongodb: MONGODB_URI,
};
