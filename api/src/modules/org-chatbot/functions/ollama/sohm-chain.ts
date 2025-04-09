import { Message } from 'ollama';
import { appConfig } from "../../../../app-config";
import { searchSacredOhmsDatabase } from "../gemini/sohm-vector-functions";
import { searchSacredOhmsDatabaseFD } from './sohm-ollama-fd';
import { addOllamaSessionMemoryFD, addToSessionMemory } from '../session-memory-function';
import { systemPromptSOhms, systemPromptSOhms_2 } from './prompt';
import { jsonrepair } from 'jsonrepair'
import { cleanResponse } from './ollama-functions';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { pull } from 'langchain/hub';
import { ChatPromptTemplate } from 'langchain/dist/prompts/chat';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { Ollama } from '@langchain/community/llms/ollama';

let session: { [key: string]: Message[] } = {};
const memoryStorage: { [key: string]: any } = {};

export async function sohmChain({
    query,
    sessionid,
    initialMemory,
}: {
    query: string;
    sessionid: string;
    initialMemory?: Message[];
}) {


    const preprompt = query.replace(/\s+/g, " ")

    //     const data = await searchSacredOhmsDatabase(preprompt);
    //     console.log("data -- ", data.documents.join("\n"));
    //     const prompt = `
    //   userQuery: ${preprompt}

    // context: ${data.documents.join("\n")}
    //   `


    // const embeddings = new OllamaEmbeddings({
    //     model: "nomic-embed-text", // default value
    //     baseUrl: "http://localhost:11434", // default value
    // });

    const data = await searchSacredOhmsDatabase(preprompt);
    console.log("context data", data.documents.map((d) => d.pageContent).join("\n\n\n=====\n\n\n"));

    const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

    const llm = new Ollama({ baseUrl: appConfig.llmUrl, model: "llama3.2" });
    const ragChain = await createStuffDocumentsChain({
        llm,
        prompt: prompt,
    });

    const finalResult = await ragChain.invoke({
        question: query,
        context: data.documents,
        system: systemPromptSOhms_2
    });
    console.log("ragChain.invoke -- ", finalResult);

    //   ///////


    // console.log("messages -- ", messages);
    // const MODEL = "hf.co/nguyenthanhthuan/Llama_3.2_1B_Intruct_Tool_Calling_V2:latest"
    // const MODEL = "llama3.2"
    // const MODEL = "nemotron-mini"
    // const MODEL = "llamachat"
    // const MODEL2 = "nemotron-mini"
    // const MODEL2 = "gemma:2b"
    // const response = await ollama.chat({
    //     model: MODEL, // or any other model you prefer
    //     messages: messages,


    // });

    // const response = await ollama.generate({
    //     model: MODEL,
    //     prompt,
    //     system: systemPromptSOhms_2,
    //     options: {
    //         temperature: 0.2
    //     }
    // });

    // messages.push(response.message);


    // Check if the model decided to use the provided function
    // console.log("The model didn't use the function. Its response was:");
    return {
        data: cleanResponse(finalResult),
        // chatHistory: messages,
        // docs: [],
        databaseSearched: false
    };



}
