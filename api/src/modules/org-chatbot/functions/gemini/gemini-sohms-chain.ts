import {
  Content,
  FunctionDeclarationsTool,
  GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";

import { appConfig } from "../../../../app-config";
import {
  searchSacredOhmsDatabase,
} from "./sohm-vector-functions";
import { addToSessionMemory, addGeminiSessionMemoryFD, allowPersonalInfo } from "../session-memory-function";
import { searchSacredOhmsDatabaseFD } from "./gemini-fd";

let session: { [key: string]: Content[] } = {};

const memoryStorage: { [key: string]: any } = {};
export async function askSohmsChain({
  collection,
  query,
  sessionid,
  initialMemory,
}: {
  collection: string;
  query: string;
  sessionid: string;

  initialMemory?: Content[];
}) {
  const functions = {
    searchSacredOhmsDatabase: ({ userQuery }) => {
      return searchSacredOhmsDatabase(userQuery);
    },

    addToSessionMemory: ({ keyNames, values, ...rest }) => {
      return addToSessionMemory(
        keyNames,
        values,
        (k: string[], v: string[]) => {
          const newitems = {};

          k.forEach((k, i) => {
            newitems[k] = v[i];
          });

          memoryStorage[sessionid] = {
            ...memoryStorage[sessionid],
            ...newitems,
            updatedAt: now.toISOString(),
          };
        }
      );
    },
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

  const systemPrompt = `
  You are chatbot for Sacred Ohms.

  Sacred Ohms is an exclusive, members-only, integrated booking platform that revolutionizes the wellness experience by seamlessly connecting vetted Retreat Leaders to energetically aligned properties, fostering a harmonious booking experience for all: Reducing friction for Retreat Leaders, Growing revenue for Ohm Owners, Discovering new locations, Searchable niche-focused amenities, Programming designed to elevate the retreat experience all, save user provided data to addToSessionMemory.

  Instructions: user session memory to save important user provided data. do not give session data to user directly.

  Generate response: find answer from sacred ohms database.
  `;

  const generativeModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [
      {
        functionDeclarations: [
          searchSacredOhmsDatabaseFD,
          // saveUserNameFD,
          addGeminiSessionMemoryFD,
        ],
      },
    ] as FunctionDeclarationsTool[],
    safetySettings: [allowPersonalInfo],
    systemInstruction: systemPrompt,
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
