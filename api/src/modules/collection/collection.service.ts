import { QdrantClient } from "@qdrant/js-client-rest";
import { Request, Response } from "express";
import { getCollectionList } from "../../utils/get-collections";
import { appConfig } from "../../utils/app-config";

export async function getCollections(req: Request, res: Response) {
  try {
    // console.log("appconfig --- ", appConfig);

    const data = await getCollectionList();

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message ?? "Server Error" });
  }
}
