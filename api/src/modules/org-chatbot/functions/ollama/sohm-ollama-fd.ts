import { Tool } from "ollama";
import { getEmbeder, getStoreClient } from "../../../../utils/db";


export const searchSacredOhmsDatabaseFD: Tool = {
  type: "function",
  function: {
    name: "searchSacredOhmsDatabase",
    description: "Search vector database for additional context for user query.",
    parameters: {
      type: "object",
      required: ["userQuery"],
      properties: {
        // collectionid: {
        //   type: "string",
        //   description: "The collection name to get data from.",
        // },
        userQuery: {
          type: "string",
          description: "user query.",
        },
        // keywords: {
        //   type: "string",
        //   description:
        //     "The important words in a query. e.g. userQuery: what are the Products of Galileo Fx? keywords will be 'product'",
        // },
      },
    },
  },
};



