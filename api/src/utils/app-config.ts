import dotenv from "dotenv";
dotenv.config();

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const QDRANT_API_URL = process.env.QDRANT_API_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const USE_LOCAL_RESOURCES = process.env.USE_LOCAL_RESOURCES;

export const appConfig = {
  gApiKey: GOOGLE_AI_API_KEY,
  useLocal: USE_LOCAL_RESOURCES,
  qdrantUrl: QDRANT_API_URL,
  qdrantApiKey: QDRANT_API_KEY,
};
