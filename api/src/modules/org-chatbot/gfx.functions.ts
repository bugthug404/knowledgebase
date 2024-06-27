import { getEmbeder, getStoreClient } from "../../utils/db";

export async function searchDatabase(
  collectionid: string,
  userQuery: string,
  keywords?: string
) {
  if (!userQuery || !collectionid) {
    return { error: "Missing parameters" };
  }
  console.log("searchDatabase - keywords -- ", keywords);
  console.log("searchDatabase - query -- ", userQuery);
  const client = getStoreClient();
  const embeder = getEmbeder();

  const queryEmbeddings = await embeder.embedQuery(userQuery);
  const keywordsEmbeddings = await embeder.embedQuery(keywords);
  const documents = await client.search(collectionid, {
    vector: queryEmbeddings,
    limit: 5,
  });

  const documents2 = await client.search(collectionid, {
    vector: keywordsEmbeddings,
    limit: 5,
  });

  const docs = documents
    .concat(documents2)
    .map((doc) => (doc.payload.content as string).replace(/\s+/g, " "));

  return {
    documents: docs,
  };
}

export const searchDatabaseFD = {
  name: "searchDatabase",
  parameters: {
    type: "OBJECT",
    description:
      "Search galileo fx database for more information. Database is a collection of website data & documents.",
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
