import {
  FunctionDeclarationsTool,
  GenerateContentResult,
  GoogleGenerativeAI,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { Request, Response } from "express";
import {
  getExchangeRateFunctionDeclaration,
  makeApiRequest,
  myInformation,
  myInformationFD,
} from "./functions";
import { getEmbeder, getStoreClient } from "../../utils/db";

export async function testGenAI(req: Request, res: Response) {
  try {
    const { q: prompt } = req.query;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    // Executable function code. Put it in a map keyed by the function name
    // so that you can call it once you get the name string from the model.
    const functions = {
      getExchangeRate: ({ currencyFrom, currencyTo }) => {
        return makeApiRequest(currencyFrom, currencyTo);
      },
      myInformation: () => {
        return myInformation();
      },
    };

    const generativeModel = genAI.getGenerativeModel({
      // Use a model that supports function calling, like a Gemini 1.5 model
      model: "gemini-1.5-flash",

      // Specify the function declaration.
      tools: [
        {
          functionDeclarations: [
            getExchangeRateFunctionDeclaration,
            myInformationFD,
          ],
        },
      ] as FunctionDeclarationsTool[],
    });

    const allowPersonalInfo: SafetySetting = {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    };

    const rDocs = [
      { text: "i like to eat deserts after eating dinner" },
      //   { text: "i like to go on a walk after desert" },
    ];

    const pomt = `
    Query: ${prompt}

    Document 1: ${rDocs[0].text}
    Document 2: ${rDocs[1]?.text}

    Generate response: ignore documents if they don't match the query.
    `;

    const chat = generativeModel.startChat({
      safetySettings: [allowPersonalInfo],
      //   history: [
      //     {
      //       role: "user",
      //       parts: [
      //         { text: "what does danial like to eat after having a good meal" },
      //       ],
      //     },
      //     {
      //       role: "context",
      //       parts: [
      //         { text: "danial like to eat deserts after having a good meal" },
      //       ],
      //     },
      //   ],
    });

    console.log("pomt  -----  ", pomt);

    if (!prompt) res.status(400).json({ error: "query is required!" });

    // Send the message to the model.
    const result = await chat.sendMessage(pomt as string);

    console.log("resultss1  ----- ", result);

    if (result.response.text()) {
      console.log("direct answer  ----- ", result.response.text());
      return res.status(200).json({ result: result.response.text() });
    }

    // For simplicity, this uses the first function call found.
    const call = result.response.functionCalls()[0];

    console.log("call result -- ", call);

    let result2: GenerateContentResult;
    if (call) {
      // Call the executable function named in the function call
      // with the arguments specified in the function call and
      // let it call the hypothetical API.
      const apiResponse = await functions[call.name](call.args);

      // Send the API response back to the model so it can generate
      // a text response that can be displayed to the user.
      result2 = await chat.sendMessage([
        {
          functionResponse: {
            name: "getExchangeRate",
            response: apiResponse,
          },
        },
      ]);

      // Log the text response.
      console.log(result2.response.text());
    }
    res.status(200).json({
      prompt: prompt,
      response: result2.response.text(),
    });
  } catch (error) {
    console.log("error  ", error.response?.text);
    console.log("error  ", error.response?.candidates[0].safetyRatings);
    res.status(500).json({ error: error.message });
  }
}

export async function askQdrant(req: Request, res: Response) {
  try {
    const { query, collection } = req.query;

    console.log("query  ", query, req.query);
    console.log("collection  ", collection);

    const client = getStoreClient();

    console.log("client  ", client);

    const collectionName = collection as string;

    const embeder = getEmbeder();

    console.log("embeder  ", embeder);

    const queryVector = await embeder.embedQuery(query as string);

    const ans = await client.search(collectionName, {
      vector: queryVector,
    });

    console.info("query -- ", query);

    res.status(200).json({ data: ans });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
