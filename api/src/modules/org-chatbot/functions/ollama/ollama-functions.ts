import { getEmbeder, getStoreClient } from "../../../../utils/db";

export async function searchSacredOhmsDatabase(
  collectionid: string,
  userQuery: string,
) {
  try {
    if (!userQuery || !collectionid) {
      return { error: "Missing parameters" };
    }
    // console.log("searchDatabase - keywords -- ", keywords);
    const client = getStoreClient();
    const embeder = getEmbeder();

    const queryEmbeddings = await embeder.embedQuery(userQuery);
    const documents = await client.search(collectionid, {
      vector: queryEmbeddings,
      limit: 5,
      "with_payload": true
    });

    const docs = documents.result
      .map((doc) => (doc.payload.content as string).replace(/\s+/g, " "));

    return {
      documents: docs,
    };
  } catch (error) {
    console.log("error--", error);
  }
}

export function cleanResponse(response) {
  // Remove header tags from the response
  let cleanans = "";
  try {

    cleanans = response.replace(/<\|start_header_id\|>/g, "").replace(/<\|end_header_id\|>/g, "").trim();
  } catch (error) {

  }
  return cleanans;
}


