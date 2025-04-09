import { SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Tool } from "ollama";

export async function addToSessionMemory(
    keyNames: string[],
    values: string[],
    callback: (query: string[], ans: string[]) => void
) {
    if (!keyNames || !values) {
        return { error: "Missing parameters" };
    }

    callback(keyNames, values);

    return {
        message: "saved " + keyNames,
    };
}

export const addGeminiSessionMemoryFD = {
    name: "addToSessionMemory",
    parameters: {
        type: "OBJECT",
        description: "To remember single or multiple information.",
        properties: {
            keyNames: {
                type: "STRING",
                description: "The information key name. e.g. 'name', e.g. 'name email'",
            },
            values: {
                type: "STRING",
                description: "The values to be saved. e.g. 'John', e.g. 'John <EMAIL>'",
            },
        },
        required: ["keyNames", "values"],
    },
};

export const allowPersonalInfo: SafetySetting = {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
};


export const addOllamaSessionMemoryFD: Tool = {
    type: "function",
    function: {
        name: "addToSessionMemory",
        description: "If user provide information like name, place, email, phone, etc. save it to current session.",
        parameters: {
            type: "object",
            required: ["keyNames", "values"],
            properties: {
                keyNames: {
                    type: "string",
                    description: "The information key name. e.g. 'name', e.g. 'name email'",
                },
                values: {
                    type: "string",
                    description: "The values to be saved. e.g. 'John', e.g. 'John <EMAIL>'",
                },
            },
        },
    },
};
