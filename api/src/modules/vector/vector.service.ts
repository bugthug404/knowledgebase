import { Request, Response } from "express";
import { addToStoreCustom, getStoreClient } from "../../utils/db";
import { searchDatabase } from "../org-chatbot/gfx.functions";
import { getEmbeder } from "../../utils/vector-db";
import { generateUUID, generateUUID2 } from "../cv-ranking/utils";
import { QdrantClient } from "@qdrant/js-client-rest";
import { appConfig } from "../../app-config";

// Create
export async function addText(req: Request, res: Response) {
  try {
    const { textData, collectionid } = req.body;
    if (!collectionid) {
      throw new Error("Collection ID is required as query parameter");
    }
    if (!textData) {
      throw new Error("Text data is required in request body");
    }


    const client = getStoreClient();

    try {
      await client.getCollection(collectionid);
    } catch (error) {
      console.error("error getting collection ---- ", error?.response?.data);
      if ((error?.response?.data?.status?.error as string).startsWith("Not found:"))
        await client.createCollection(collectionid, {
          vectors: {
            size: 768,
            distance: "Cosine",
          },
        });
    }


    const texts: string[] = [textData];
    const embedder = getEmbeder();
    const docEmbedding = await embedder.embedDocuments(texts);


    const points = docEmbedding.map((doc, i) => {
      return {
        id: generateUUID(),
        vector: doc,
        payload: {
          content: texts[i],
          addMethod: "single",
        },
      }
    });

    console.log("points  -- ", points[0]?.id);

    const op = await client.upsert(collectionid, {
      // wait: true,
      points: points,
    });

    console.log("op -- ", op);
    res.json({ status: "Text added successfully", data: op }).status(201);

  } catch (error: any) {
    console.error(Object.keys(error));
    console.error("error message -- ", error.message);
    console.error("error name -- ", error.name);
    console.error("error response -- ", error.response);
    res.status(500).json({ error: error.message ?? "Internal server error" });
  }
}

// Read
export async function getText(req: Request, res: Response) {
  try {
    const { collectionid, ids } = req.body;

    if (!collectionid) {
      throw new Error("Collection ID is required as query parameter");
    }
    if (!ids || !Array.isArray(ids)) {
      throw new Error("Array of IDs is required in request body");
    }

    const client = getStoreClient();
    const text = await client.retrieve(collectionid as string, { ids });
    res.json({ data: text }).status(200);
  } catch (error: any) {
    console.log("error getting vector docs --- ", error);
    res.status(500).json({ error: error.message ?? "Internal server error" });
  }
}

export async function listTexts(req: Request, res: Response) {
  try {
    // console.info("listTexts -- ");
    const { collectionid } = req.query;
    const { limit = 20, offset = 0, with_payload = true, with_vector = false } = req.body;

    if (!collectionid) {
      throw new Error("Collection ID is required as query parameter");
    }

    const client = getStoreClient();
    const texts = await client.scroll(collectionid as string,
      { limit, offset, with_payload, with_vector, }
    );
    // console.info("listTexts -- ", texts.result.points);
    res.json({ data: texts }).status(200);
  } catch (error: any) {
    res.status(500).json({ error: error.message ?? "Internal server error" });
  }
}

export async function searchTexts(req: Request, res: Response) {
  try {
    const { collectionid } = req.query;
    const { userQuery, limit = 20, with_payload = true, with_vector = false } = req.body;

    if (!collectionid) {
      throw new Error("Collection ID is required as query parameter");
    }
    if (!userQuery) {
      throw new Error("User query is required in request body");
    }

    const client = getStoreClient();
    const embeder = getEmbeder();

    const queryEmbeddings = await embeder.embedQuery(userQuery);
    const documents = await client.search(collectionid as string, {
      vector: queryEmbeddings,
      limit,
      with_payload,
      with_vector,

    });


    console.info("searchTexts -- ", documents);

    res.json({ data: documents.result }).status(200);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message ?? "Internal server error" });
  }
}

export async function updateText(req: Request, res: Response) {
  try {
    const { id, updateData, collectionid } = req.body;

    if (!collectionid) {
      throw new Error("Collection ID is required as query parameter");
    }
    if (!id || !updateData) {
      throw new Error("ID and update data are required in request body");
    }

    const client = getStoreClient();
    const result = await client.update(collectionid as string, id, updateData);
    res.json({ status: "Text updated successfully", data: result }).status(200);
  } catch (error: any) {
    res.status(500).json({ error: error.message ?? "Internal server error" });
  }
}

export async function deleteText(req: Request, res: Response) {
  try {
    const { collectionid } = req.query;
    const { id } = req.body;

    if (!collectionid) {
      throw new Error("Collection ID is required as query parameter");
    }
    if (!id) {
      throw new Error("ID is required in request body");
    }

    const client = getStoreClient();
    await client.delete(collectionid as string, id);
    res.json({ status: "Text deleted successfully" }).status(200);
  } catch (error: any) {
    res.status(500).json({ error: error.message ?? "Internal server error" });
  }
}
