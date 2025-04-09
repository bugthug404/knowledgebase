import { Request, Response } from "express";

// const { Document } = require("docxtemplater");
import { askFcChain } from "../../utils/ask-chain";

import { FunctionDeclaration } from "@google/generative-ai";
import { searchDatabase, searchDatabaseFD } from "./gfx.functions";

const memoryStorage: { [key: string]: any } = {};
export async function askGfxBot(req: Request, res: Response) {
  console.log("ask document");
  try {
    const { query, collection } = req.query;

    if (!query || !collection) {
      res
        .status(400)
        .json({ error: "Missing required parameters for this request." });
      return;
    }

    const today = new Date();

    const systemPrompt = `
    You are an polite & professional sales assistant for Galileo Fx. you help user with general information like about the company, pricing, faq's etc. You do not give stock suggestions to users.
    
    Galileo Fx Trading bot only trade when selected stock market is open. To check if your stock open or closed visit tradinghours [https://www.tradinghours.com/markets].

    save user provided data to addToSessionMemory.
    
    Generate response: find answer from database.
    `;

    const functions = {
      searchDatabase: ({ collectionid, userQuery, keywords }) => {
        return searchDatabase(collectionid, userQuery, keywords);
      },
    };

    const ans = await askFcChain({
      collection: collection as string,
      query: query as string,
      sessionid: req.session.id,
      systemPrompt,
      functions,
      functionDeclarations: [searchDatabaseFD] as FunctionDeclaration[],
      memoryStorage,
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
