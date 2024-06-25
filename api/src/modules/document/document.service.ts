import { Request, Response } from "express";

import { Buffer } from "buffer"; // Import Buffer class
import fs from "fs";
import { PDFExtract } from "pdf.js-extract";
// const { Document } = require("docxtemplater");
import { addToStore, addToStoreCustom } from "../../utils/db";
import { askChain, askChainCustom, askFcChain } from "../../utils/ask-chain";
import officeParser from "officeparser";

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

      console.log(" full text -- ", fullText.substring(0, 200));
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

    await addToStoreCustom(collectionName, fullText);

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

    const ans = await askFcChain({
      collection: collection as string,
      query: query as string,
      sessionid: req.session.id,
    });

    res.send({ data: ans.data, chatHistory: ans.chatHistory }).status(200);
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
