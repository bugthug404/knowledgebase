import { Request, Response } from "express";

import { Buffer } from "buffer"; // Import Buffer class
import fs from "fs";
import { PDFExtract } from "pdf.js-extract";
// const { Document } = require("docxtemplater");
import { addToStore } from "../../utils/db";
import { askChain } from "../../utils/ask-chain";

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

    const tempFilePath = "temp";

    await fs.promises.writeFile(tempFilePath, pdfData);
    let fullText = "";

    if (fileType === ".pdf") {
      const pdfExtract = new PDFExtract();
      const textData = await pdfExtract.extract(tempFilePath);
      fullText = textData.pages
        .map((v) => v.content.map((e) => e.str).join(" "))
        .join(" ");
    } else if (fileType === ".txt") {
      fs.readFile(tempFilePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        fullText = data.split("\n").join(" ");
        console.log("fulltext sample", fullText.substring(0, 500));
      });
    }
    // else if (fileType === ".doc") {
    //   // Use docxtemplater or another library to extract text from DOC file

    //   const doc = new Docxtemplater() ;
    //   doc.load(tempFilePath); // Load the DOC file
    //   const text = doc.get("text"); // Extract text content

    //   if (text) {
    //     fullText = text;
    //   }
    // }
    else {
      return res.status(400).send({ error: "fileType is required" });
    }

    await addToStore(collectionName, fullText);

    res.json({ status: "data uploaded successfully" }).status(200);
  } catch (error: any) {
    console.error(error);
    res.json({ error: error.message ?? "Internal server error" }).status(500);
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

    const ans = await askChain({
      collection: collection as string,
      query: query as string,
    });
    console.info("query -- ", query);
    console.info("ans -- ", ans);
    res.send({ data: ans });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
