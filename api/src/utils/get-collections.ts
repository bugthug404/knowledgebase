// get all collections from qdrant

import { QdrantClient } from "@qdrant/js-client-rest";
import { appConfig } from "./app-config";
import { getStore, getStoreClient } from "./db";

export async function getCollectionList() {
  const client = getStoreClient();

  const list = await client.getCollections();

  console.log("list", list);
  return list.collections;
}

export async function checkExistingCollection(collectionName: string) {
  const { qdrantApiKey, qdrantUrl } = appConfig;
  if (!appConfig.useLocal && !!qdrantApiKey && !!qdrantApiKey) {
    const client = new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    });
    return await client.getCollection(collectionName);
  } else {
    const client = new QdrantClient({
      url: "http://localhost",
      port: 6333,
    });
    return await client.getCollection(collectionName);
  }
}
