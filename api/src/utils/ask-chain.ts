import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { getEmbeder, getLLM, getStore, getStoreClient } from "./db";
import { ChatPromptTemplate } from "langchain/dist/prompts/chat";
import { pull } from "langchain/hub";
import {
  Content,
  FunctionDeclarationsTool,
  GoogleGenerativeAI,
} from "@google/generative-ai";

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
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
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
