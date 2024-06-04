import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import axios from "axios";
// import { JSDOM } from "jsdom/lib/jsdom/living/";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import cheerio from "cheerio";
import { addToStore } from "../../../utils/db";

export async function saveUrlData(
  url: string,
  colName: string,
  title?: string,
  pageText?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const textContent = pageText;

    const removeEmptyLines = (textContent: string) => {
      const lines = textContent.split("\n");
      const nonEmptyLines = lines.filter((line) => line.trim());
      return nonEmptyLines.join("\n");
    };

    const cleanedTextContent = removeEmptyLines(textContent);

    await addToStore(colName, cleanedTextContent);

    return { success: true };
  } catch (e) {
    console.log("error", e);

    return { error: e.message ?? "error" };
  }
}
