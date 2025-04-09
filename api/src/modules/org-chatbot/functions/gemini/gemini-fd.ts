import {
  HarmBlockThreshold,
  HarmCategory,
  SafetySetting,
} from "@google/generative-ai";
import { getEmbeder, getStoreClient } from "../../../../utils/db";



export const searchSacredOhmsDatabaseFD = {
  name: "searchSacredOhmsDatabase",
  parameters: {
    type: "OBJECT",
    description: "Search sacred ohms database for information.",
    properties: {
      collectionid: {
        type: "STRING",
        description: "The collection name to get data from.",
      },
      userQuery: {
        type: "STRING",
        description: "The query from user.",
      },
      keywords: {
        type: "STRING",
        description:
          "The important words in a query. e.g. userQuery: what are the Products of Galileo Fx? keywords will be 'product'",
      },
    },
    required: ["collectionid", "userQuery", "keywords"],
  },
};

