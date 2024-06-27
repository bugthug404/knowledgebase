import { Request, Response } from "express";
import { askFcChain } from "../../utils/ask-chain";

import { FunctionDeclaration } from "@google/generative-ai";
import { searchDatabase, searchDatabaseFD } from "./gfx.functions";
import {
  searchSacredOhmsDatabase,
  searchSacredOhmsDatabaseFD,
} from "./sohm.functions";

export async function askSOBot(req: Request, res: Response) {
  console.log("ask document");
  try {
    const { query, collection } = req.query;

    if (!query || !collection) {
      res
        .status(400)
        .json({ error: "Missing required parameters for this request." });
      return;
    }

    const systemPrompt = `
    You are chatbot for Sacred Ohms. 

    Sacred Ohms is an exclusive, members-only, integrated booking platform that revolutionizes the wellness experience by seamlessly connecting vetted Retreat Leaders to energetically aligned properties, fostering a harmonious booking experience for all: Reducing friction for Retreat Leaders, Growing revenue for Ohm Owners, Discovering new locations, Searchable niche-focused amenities, Programming designed to elevate the retreat experience all, save user provided data to addToSessionMemory.

    Generate response: find answer from sacred ohms database.
    `;

    const functions = {
      searchSacredOhmsDatabase: ({ collectionid, userQuery, keywords }) => {
        return searchSacredOhmsDatabase(collectionid, userQuery, keywords);
      },
    };

    const ans = await askFcChain({
      collection: collection as string,
      query: query as string,
      sessionid: req.session.id,
      systemPrompt,
      functions,
      functionDeclarations: [
        searchSacredOhmsDatabaseFD,
      ] as FunctionDeclaration[],
    });

    res
      .send({ data: ans.data, chatHistory: ans.chatHistory, docs: ans.docs })
      .status(200);
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
