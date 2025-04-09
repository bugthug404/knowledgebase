import { getEmbeder, getStoreClient } from "../../../../utils/db";

export async function searchSacredOhmsDatabase(
  // collectionid?: string,
  userQuery: string,
  // keywords?: string
) {
  try {
    if (!userQuery) {
      return { error: "Missing parameters" };
    }
    // console.log("searchDatabase - keywords -- ", keywords);
    const client = getStoreClient();
    const embeder = getEmbeder();

    const queryEmbeddings = await embeder.embedQuery(userQuery);
    const documents = await client.search("sacredohms", {
      vector: queryEmbeddings,
      limit: 10,
      "with_payload": true
    });

    console.log("documents -- ", (documents?.result?.length));
    const docs
      = documents.result
        .filter((doc) => doc.score > 0.5)
        .map((doc) => { return { pageContent: (doc.payload.content as string).replace(/\s+/g, " "), metadata: {} } });
    console.log("selected documents -- ", (docs?.length), docs);
    // const brand = {
    //   pageContent: "Sacred Ohms is an exclusive, members - only, integrated booking platform that revolutionizes the wellness experience by seamlessly connecting vetted Retreat Leaders to energetically aligned properties, fostering a harmonious booking experience for all: Reducing friction for Retreat Leaders, Growing revenue for Ohm Owners, Discovering new locations, Searchable niche - focused amenities, Programming designed to elevate the retreat experience all.",
    //   metadata: {
    //     type: "brand",
    //   }
    // }


    return {
      documents: [...docs],
    };
  } catch (error) {
    console.log("error--", error);
  }
}
