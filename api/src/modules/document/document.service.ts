import { Request, Response } from "express";

import { Buffer } from "buffer"; // Import Buffer class
import fs from "fs";
// const { Document } = require("docxtemplater");
import { addToStoreCustom, addToStoreUnique } from "../../utils/db";
import { askFcChain } from "../../utils/ask-chain";
import officeParser from "officeparser";
import { searchDatabase, searchDatabaseFD } from "../../utils/functions";
import { FunctionDeclaration } from "@google/generative-ai";

export async function addDocument(req: Request, res: Response) {
  try {
    const { data: dataUri, collectionName, fileType } = req.body as any;

    if (!dataUri) {
      return res.status(400).send({
        error: "data is required",
      });
    }

    if (!collectionName) {
      return res.status(400).send({
        error: "collection name is required",
      });
    }

    const base64Data = dataUri.split(",")[1];
    const pdfData = Buffer.from(base64Data, "base64");

    const tempFilePath = "temp" + fileType;

    await fs.promises.writeFile(tempFilePath, pdfData);
    let fullText = "";

    if (fileType === ".txt") {
      const d = await fs.promises.readFile(tempFilePath, "base64");
      const decodedText = Buffer.from(d, "base64").toString("utf8");

      fullText = decodedText.replaceAll(/\s+/g, " ");
    } else if (
      fileType === ".docx" ||
      fileType === ".pptx" ||
      fileType === ".xlsx" ||
      fileType === ".odt" ||
      fileType === ".odp" ||
      fileType === ".ods" ||
      fileType === ".pdf"
    ) {
      fullText = await officeParser.parseOfficeAsync(tempFilePath);
    } else {
      return res.status(400).send({ error: "Invalid file or filetype" });
    }

    if (fullText.length === 0)
      return res.status(400).send({ error: "Empty file" });

    await addToStoreUnique(collectionName, fullText);

    res.json({ status: "data uploaded successfully" }).status(200);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message ?? "Internal server error" });
  }
}

export async function askDocument(req: Request, res: Response) {
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
    You are an sales assistant for GalileoFx. you help user with general information like about the company, product information, faq's etc.

    You ask questions when you don't know the answer. You speak very politly and you are very professional.
    
    You know when United States (US) stock market is open and when it is closed. You do not give stock suggestions to users.

    Galileo Fx trading bot will not trade when US market is closed.
    
    save user provided data to addToSessionMemory.
    
    Generate response: search database for the information if necessary.
    `;

    const sp = `
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
      systemPrompt: sp,
      functions,
      functionDeclarations: [searchDatabaseFD] as FunctionDeclaration[],
    });

    res
      .send({
        data: ans.data,
        chatHistory: ans.chatHistory,
        documents: ans?.docs ?? [],
      })
      .status(200);
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
