import dotenv from "dotenv";
dotenv.config();

// console.log("GOOGLE_AI_API_KEY:", process.env.GOOGLE_AI_API_KEY);
// console.log("QDRANT_API_URL:", process.env.QDRANT_API_URL);
// console.log("QDRANT_API_KEY:", process.env.QDRANT_API_KEY);
// console.log("USE_LOCAL_RESOURCES:", process.env.USE_LOCAL_RESOURCES);

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const QDRANT_API_URL = process.env.QDRANT_API_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const USE_LOCAL_RESOURCES = process.env.USE_LOCAL_RESOURCES;

export const appConfig = {
  gApiKey: GOOGLE_AI_API_KEY,
  useLocal: USE_LOCAL_RESOURCES,
  qdrantUrl: QDRANT_API_URL,
  qdrantApiKey: QDRANT_API_KEY,

  // init: function () {
  //   // this.gApiKey = process.env.GOOGLE_AI_API_KEY;
  //   // this.useLocal = process.env.USE_LOCAL_RESOURCES;
  //   // this.qdrantUrl = process.env.QDRANT_API_URL;
  //   // this.qdrantApiKey = process.env.QDRANT_API_KEY;
  // },
};
