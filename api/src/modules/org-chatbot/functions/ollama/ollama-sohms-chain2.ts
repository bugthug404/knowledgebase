import { Message, Ollama } from 'ollama';
import { appConfig } from "../../../../app-config";
import { searchSacredOhmsDatabase } from "../gemini/sohm-vector-functions";
import { searchSacredOhmsDatabaseFD } from './sohm-ollama-fd';
import { addOllamaSessionMemoryFD, addToSessionMemory } from '../session-memory-function';
import { systemPromptSOhms } from './prompt';
import { jsonrepair } from 'jsonrepair'
import { cleanResponse } from './ollama-functions';

let session: { [key: string]: Message[] } = {};
const memoryStorage: { [key: string]: any } = {};

export async function ollamaSohmsChain({
  collection,
  query,
  sessionid,
  initialMemory,
}: {
  collection: string;
  query: string;
  sessionid: string;
  initialMemory?: Message[];
}) {

  console.log("sessionid -- ", sessionid);
  const functions = {
    searchSacredOhmsDatabase: ({ userQuery, }) => {
      return searchSacredOhmsDatabase(userQuery);
    },
  };

  session[sessionid] = session[sessionid] || initialMemory || [];

  function removeOldSessions(memoryStorage, expirationTimeInHours = 1) {
    const oneHourAgo = new Date(Date.now() - expirationTimeInHours * 60 * 60 * 1000);
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

  // const sessiontData = JSON.stringify(memoryStorage?.[sessionid]);
  // const today = new Date();
  const prompt = `${query.replace(/\s+/g, " ")}
  `;
  // sessionid: ${sessionid}
  // collectionid: ${collection}
  // SessionStorageContext: ${sessiontData}
  // User's current date and time is ${today.toDateString()}

  const messages: Message[] = [
    // { role: 'system', content: systemPromptSOhms },
  ];

  if (session[sessionid] && session[sessionid].length) {
    messages.push(...session[sessionid].map(msg => ({ role: msg.role, content: msg.content })));
  }
  messages.push({ role: 'user', content: prompt.replace(/\s+/g, " ") });


  const ollama = new Ollama({ host: appConfig.llmUrl, })

  // console.log("messages -- ", messages);
  // const MODEL = "hf.co/nguyenthanhthuan/Llama_3.2_1B_Intruct_Tool_Calling_V2:latest"
  const MODEL = "llama3.2"
  // const MODEL = "nemotron-mini"
  // const MODEL = "llamachat"
  // const MODEL2 = "nemotron-mini"
  // const MODEL2 = "gemma:2b"
  const response = await ollama.chat({
    model: MODEL, // or any other model you prefer
    messages: messages,
    tools: [
      searchSacredOhmsDatabaseFD,
      // addOllamaSessionMemoryFD
    ]

  });
  console.log("initial response -- ", response);
  console.log("initial tool_calls -- ", response.message?.tool_calls?.[0]?.function);

  messages.push(response.message);


  // Check if the model decided to use the provided function
  if (!response.message.tool_calls || response.message.tool_calls.length === 0) {
    console.log("The model didn't use the function. Its response was:");
    console.log(typeof response.message.content, response.message.content.split("\n\n").pop());
    return {
      data: cleanResponse(response?.message?.content),
      // chatHistory: messages,
      // docs: [],
      databaseSearched: false
    };
  }


  if (response.message.tool_calls) {

    for (const tool of response.message.tool_calls) {
      console.log("tool -- ", tool);
      const functionToCall = functions[tool.function.name];
      const functionResponse = await functionToCall(tool.function.arguments);
      // Add function response to the conversation
      messages.push({
        role: 'tools',
        content: (functionResponse?.documents?.join(' \n') || ""),
      });
      session[sessionid].push({ role: 'content', content: (functionResponse?.documents?.join(' \n') || "") });

      console.log("about to call -- ", functionResponse);
    }
  }

  console.log("messages for finalResponse -- ", messages);

  const finalResponse = await ollama.chat({
    model: MODEL,
    messages: messages,
  });

  session[sessionid].push({ role: 'assistant', content: finalResponse?.message?.content });

  return {
    data: cleanResponse(finalResponse?.message?.content),
    databaseSearched: true
    // chatHistory: messages,
    // docs: apiResponse?.documents ?? [],
  };
}
