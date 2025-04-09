import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { getEmbeder, getLLM, getStore, getStoreClient } from "./db";
import { ChatPromptTemplate } from "langchain/dist/prompts/chat";
import { pull } from "langchain/hub";
import {
  Content,
  FunctionDeclaration,
  FunctionDeclarationsTool,
  GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { appConfig } from "../app-config";
import { addGeminiSessionMemoryFD, addToSessionMemory, allowPersonalInfo } from "../modules/org-chatbot/functions/session-memory-function";

export async function askChain({
  collection,
  query,
}: {
  collection: string;
  query: string;
}) {
  const retriever = (await getStore(collection as string)).asRetriever(10);

  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const ragChain = await createStuffDocumentsChain({
    llm: getLLM(true) as any,
    prompt: prompt,
  });

  const retrivedDocs = await retriever.invoke(query as string);

  return {
    ans: await ragChain.invoke({
      question: query,
      context: retrivedDocs,
    }),
    docsUsed: retrivedDocs,
  };
}

const chatHistory: Content[] = [];

export async function askChainCustom({
  collection,
  query,
}: {
  collection: string;
  query: string;
}) {
  console.log("askChainCustom");
  const client = getStoreClient();
  const genAI = new GoogleGenerativeAI(appConfig.gApiKey);
  const generativeModel = genAI.getGenerativeModel({
    // Use a model that supports function calling, like a Gemini 1.5 model
    model: "gemini-1.5-flash",

    // Specify the function declaration.
    tools: [
      {
        functionDeclarations: [
          // getExchangeRateFunctionDeclaration,
          // myInformationFD,
        ],
      },
    ] as FunctionDeclarationsTool[],
  });

  const embeder = await getEmbeder();

  const queryEmbeddings = await embeder.embedQuery(query);

  const documents = await client.search(collection, {
    vector: queryEmbeddings,
  });

  const docs = documents.map(
    (doc, i) =>
      `Document:${i + 1} ` +
      (doc.payload.content as string).replace(/\s+/g, " ")
  );

  const cleanDocs = docs.join("\n");
  // return { ans: "test", docsUsed: docs };

  const pomt = `
  Query: ${query.replace(/\s+/g, " ")}

 ${cleanDocs}

 SYSTEM: Your are an intelligent chatbot to answer query based on documents. strictly do not use markdown format for output. keep responses to the point.

  Generate response: ignore documents if they don't match the query.
  `;

  const chat = generativeModel.startChat({
    history: chatHistory,
  });

  const result = await chat.sendMessage(pomt as string);

  return {
    ans: result.response.text(),
    docsUsed: documents,
  };

  // return result.response.text();

  // if (result.response.text()) {
  //   console.log("direct answer  ----- ", result.response.text());
  //   return res.status(200).json({ result: result.response.text() });
  // }
}

// const chatHistory: Content[] = [];

let session: { [key: string]: Content[] } = {};

const memStore: { [key: string]: any } = {};
export async function askFcChain({
  collection,
  query,
  sessionid,
  systemPrompt,
  functions,
  functionDeclarations,
  initialMemory,
  memoryStorage = memStore,
}: {
  collection: string;
  query: string;
  sessionid: string;
  systemPrompt?: string;
  functions: { [key: string]: Function };
  functionDeclarations: FunctionDeclaration[];
  initialMemory?: Content[];
  memoryStorage?: { [key: string]: any };
}) {
  functions.addToSessionMemory = ({ keyNames, values, ...rest }) => {
    return addToSessionMemory(keyNames, values, (k: string[], v: string[]) => {
      const newitems = {};

      k.forEach((k, i) => {
        newitems[k] = v[i];
      });

      memoryStorage[sessionid] = {
        ...memoryStorage[sessionid],
        ...newitems,
        updatedAt: now.toISOString(),
      };
    });
  };

  const now = new Date();
  session[sessionid] = session[sessionid] || initialMemory ? initialMemory : [];

  function removeOldSessions(memoryStorage, expirationTimeInHours = 1) {
    const oneHourAgo = new Date(
      Date.now() - expirationTimeInHours * 60 * 60 * 1000
    );
    for (const sessionId in memoryStorage) {
      const session = memoryStorage[sessionId];
      if (!session?.updatedAt) continue;
      const sessionDate = new Date(session.updatedAt);
      if (sessionDate < oneHourAgo) {
        delete memoryStorage[sessionId];
      }
    }
  }
  removeOldSessions(memoryStorage, 1);

  const genAI = new GoogleGenerativeAI(appConfig.gApiKey);

  const sessiontData = JSON.stringify(memoryStorage?.[sessionid]);

  const generativeModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [
      { functionDeclarations: [...functionDeclarations, addGeminiSessionMemoryFD] },
    ] as FunctionDeclarationsTool[],
    safetySettings: [allowPersonalInfo],
    systemInstruction:
      systemPrompt ??
      `
    You are a intelligent chatbot to help user to find information from database.
    
    Generate response: search database for the information if necessary.
    `,
  });

  const today = new Date();
  console.log("sessiontData", sessiontData);
  const pomt = `Query: ${query.replace(/\s+/g, " ")}
  SessionStorageContext: ${sessiontData}
  User's current date and time is ${today.toDateString()}
  sessionid: ${sessionid}
  collectionid: ${collection}
  `;

  const chat = generativeModel.startChat({
    history: session[sessionid],
  });

  const result = await chat.sendMessage(pomt as string);

  if (result?.response?.text()) {
    console.log("direct answer  ----- ", result.response.text(), session);

    return { data: result.response.text(), chatHistory: session[sessionid] };
  }

  const call = result.response.functionCalls()[0];

  let result2: GenerateContentResult;
  let apiResponse: any;
  if (call) {
    apiResponse = await functions[call.name](call.args);

    console.log("api response  --- ", apiResponse);

    result2 = await chat.sendMessage([
      {
        functionResponse: {
          name: call.name,
          response: apiResponse,
        },
      },
    ]);

    // Log the text response.
    console.log(result2.response.text());
  }

  return {
    data: result2.response.text(),
    chatHistory: session[sessionid],
    docs: apiResponse?.documents ?? [],
  };
}
