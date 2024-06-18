import { Request, Response } from "express";

import { Buffer } from "buffer"; // Import Buffer class
import fs from "fs";
import { PDFExtract } from "pdf.js-extract";
// const { Document } = require("docxtemplater");
import { addToStore, getEmbeder, getStoreClient } from "../../utils/db";
import { askChain } from "../../utils/ask-chain";
import officeParser from "officeparser";
import {
  accountJD,
  acv1,
  necv1,
  necv2,
  sdJD,
  sdcv1,
  sdcv2,
  sdcv3,
  sdcv4,
  sdcv5,
  sdcv6,
  sdcv7,
} from "./query";
import { QdrantClient } from "@qdrant/js-client-rest";
import { generateUUID } from "./utils";
import {
  FunctionDeclarationSchemaType,
  FunctionDeclarationsTool,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";

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
      fs.readFile(tempFilePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        fullText = data.split("\n").join(" ");
        console.log("fulltext sample", fullText.substring(0, 500));
      });
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
      return console.log("fulltext sample", fullText.substring(0, 100));
    } else {
      return res.status(400).send({ error: "Invalid file or filetype" });
    }

    await addToStore(collectionName, fullText);

    res.json({ status: "data uploaded successfully" }).status(200);
  } catch (error: any) {
    console.error(error);
    res.json({ error: error.message ?? "Internal server error" }).status(500);
  }
}

export async function getRanking(req: Request, res: Response) {
  console.log("ask document");
  try {
    const { query = sdJD, collection = "cvr" } = req.query;

    if (!query || !collection) {
      res
        .status(400)
        .json({ error: "Missing required parameters for this request." });
      return;
    }

    const embeder = getEmbeder();

    const dataEmbeddings = await embeder.embedQuery(query as string);

    const store = getStoreClient();

    const ans = await store.search(collection as string, {
      vector: dataEmbeddings,
      filter: {},
    });

    const filteredAns = ans.map((ans) => {
      const { score, payload } = ans;
      return { score, name: payload.name };
    });

    res.send({ data: filteredAns }).status(200);
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}

export async function addPdf(req: Request, res: Response) {
  try {
    console.log("check pdf");
    const { data: pdfText, name } = req.body as any;

    if (!pdfText) {
      return res.status(400).send({
        error: "data is required",
      });
    }

    const embeder = getEmbeder();

    const dataEmbeddings = await embeder.embedQuery(pdfText);
    console.log("dataEmbeddings", !!dataEmbeddings);

    const store = getStoreClient();

    try {
      const exists = await store.getCollection("cvr");
      console.log("exists", exists);
    } catch (error) {
      console.log("error checking collection  ---- ", error.message);
      const vectorSize = dataEmbeddings.length; // Assuming all embeddings have same size
      await store.recreateCollection("cvr", {
        vectors: {
          size: vectorSize,
          distance: "Cosine", // You can choose a suitable distance metric
        },
      });
    }

    const addResult = await store.upsert("cvr", {
      wait: true,
      points: [
        {
          id: generateUUID(),
          vector: dataEmbeddings,
          payload: {
            text: pdfText,
            name: name,
          },
        } as any,
      ],
    });

    // const addResult = await store.createCollection("cvr",{
    //   vectors:[
    //     {
    //       vector: dataEmbeddings,
    //       payload: {
    //         text: pdfText,
    //       },
    //     } as Record<string, unknown>,
    //   ]
    // });

    console.log("addResult", addResult);
    res.status(200).json({
      data: addResult,
    });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}

let genAI: GoogleGenerativeAI;
let generativeModel: GenerativeModel;

export async function getSimilarityScore(req: Request, res: Response) {
  try {
    const { jobDescription = sdJD, cvData = sdcv3 } = req.body;

    if (!jobDescription || !cvData) {
      return res.status(400).send({
        error: "missing required parameters for this request.",
      });
    }

    if (!genAI || !generativeModel) {
      genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

      generativeModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `
        System: strictly do not use markdown formating for the output. keep response presice & to the point. strictly follow output format example. strictly do not use new line characters in output. get candidate information from resume. Make sure to return valid JSON.

        RatingScale: [
          {
            scoreRange: 91-100,
            description: "Candidate's resume showcases skills that perfectly align with the job description, including some additional directly relevant skills not mentioned. Their experience is highly relevant and directly applies to the job requirements."
          },
          {
            scoreRange: 81-90,
            description: "Candidate's resume demonstrates skills that mostly align with the job description. They possess transferable skills that could be adapted to the role. Their experience is highly relevant and directly applies to the job requirements."
          },
          {
            scoreRange: 71-80,
            description: "Candidate's resume highlights skills that partially align with the job description. They might have some directly relevant skills, but also some irrelevant ones. Their experience is somewhat relevant, but may require additional training for the specific job requirements."
          },
          {
            scoreRange: 61-70,
            description: "Candidate's resume showcases skills that have some overlap with the job description, but there are also significant gaps. Their experience is relevant in a different context, and may not directly translate to this role."
          },
          {
            scoreRange: 51-60,
            description: "A few of the candidate's skills or experience  don't directly match the job description. They might have some transferable skills, but may require significant upskilling or reskilling."
          },
          {
            scoreRange: 41-50,
            description: "Candidate's resume exhibits skills that mostly don't match the job description. While there might be some transferable skills, significant gaps exist. Their experience is not directly relevant and may require substantial adaptation for this role."
          },
          {
            scoreRange: 31-40,
            description: "Candidate's resume presents skills that are very different from the job description. They might have some relevant experience, but it's in a completely different field and may not be easily transferable."
          },
          {
            scoreRange: 21-30,
            description: "Candidate's resume showcases skills that have minimal alignment with the job description. They lack directly relevant skills and experience seems unrelated to the position's requirements."
          },
          {
            scoreRange: 11-20,
            description: "Candidate's resume offers very little that aligns with the job description. The skills and experience  presented  appear irrelevant to the role. Consider reviewing the resume format or if it's for the correct position."
          },
          {
            scoreRange: 1-10,
            description: "The resume appears invalid or incomplete, or the job description might be missing crucial information. It's difficult to assess the candidate's fit based on the provided documents. Consider requesting a revised resume or a more detailed job description."
          }
        ]
  
      Generate Output Format Example: { "score": select a number from the scoreRange based on how suitable is the resume, "candidateInfo": { "name": "John", "email": "john@example.com", "role": "Accountant", "phone": "+1234567890", "location": "New York, NY", }, "error": "cannot your process due to invalid input data"  | null }
  
      Generate response: Get RatingScale score as a output for user query. important- Throw error in output if Job description is not valid.
      `,
      });
    }

    const prompt3 = `
    Query: How much is Resume suitable according to the RatingScale.
    
    Job Description: ${jobDescription}

    Resume: ${cvData}
    `;

    const tokens = prompt3.split(" ").length;

    console.log("tokens --", tokens);

    const chat = generativeModel.startChat({
      generationConfig: {
        // maxOutputTokens: 100,
        responseSchema: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            scoreRange: {
              type: FunctionDeclarationSchemaType.NUMBER,
              properties: {},
            },
          },
        },
      },
    });

    let result = await chat.sendMessage(prompt3);

    console.log("gemini output  --", result.response.text().substring(0, 50));
    console.log("gemini output JSON --", JSON.parse(result.response.text()));

    res.status(200).json({
      // prompt: prompt,
      response: result.response.text(),
    });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
