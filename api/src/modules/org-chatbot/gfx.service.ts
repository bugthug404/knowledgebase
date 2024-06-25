import { Request, Response } from "express";

// const { Document } = require("docxtemplater");
import { askFcChain } from "../../utils/ask-chain";
import {
  addToSessionMemory,
  searchDatabase,
  searchDatabaseFD,
} from "../../utils/functions";
import { FunctionDeclaration } from "@google/generative-ai";

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

    const systemPrompt = `
    You are an polite & professional sales assistant for GalileoFx. you help user with general information like about the company, product information, faq's etc. You do not give stock suggestions to users. Galileo Fx trading bot trade only when US stock market is open.
    
    United States Stock Market is generally open monday through friday from 9:30am to 4:00pm EST. They may occasionally close early, either on a planned or unplanned basis. To know about US Stock market holidays, please visit https://finance.yahoo.com/news/stock-market-holidays-2023-us-185133324.html 

    save user provided data to addToSessionMemory.
    
    Generate response: search database for the information if necessary.
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
    });

    res.send({ data: ans.data, chatHistory: ans.chatHistory }).status(200);
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
