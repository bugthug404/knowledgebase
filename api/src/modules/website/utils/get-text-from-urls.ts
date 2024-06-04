// Depricated file////////./////////////////////
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import axios from "axios";
import { JSDOM } from "jsdom";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function getTextFromUrls(
  urls: { url: string; title?: string }[],
  domain?: string
): Promise<{ url: string; content: string; title?: string }[]> {
  if (urls.length === 0) {
    return [];
  }

  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await axios.get(url.url);
        if (response.status > 299) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const dom = new JSDOM(response.data);
        const body = dom.window.document.body;

        const removeScripts = (node) => {
          for (let i = node.childNodes.length - 1; i >= 0; i--) {
            const child = node.childNodes[i];
            if (
              child.nodeName.toLowerCase() === "script" ||
              child.nodeName.toLowerCase() === "iframe" ||
              child.nodeName.toLowerCase() === "footers" ||
              child.nodeName.toLowerCase() === "header" ||
              child.nodeName.toLowerCase() === "style"
            ) {
              child.parentNode.removeChild(child);
            } else {
              removeScripts(child);
            }
          }
        };

        removeScripts(body);

        const textContent = body.textContent.trim();
        console.log("textContent ====", textContent);
        const removeEmptyLines = (textContent: string) => {
          const lines = textContent.split("\n");
          const nonEmptyLines = lines.filter((line) => line.trim());
          return nonEmptyLines.join("\n");
        };

        const cleanedTextContent = removeEmptyLines(textContent);
        console.log("cleanedTextContent ====", cleanedTextContent);

        return { ...url, content: cleanedTextContent };

        //     const textSplitter = new RecursiveCharacterTextSplitter({
        //       chunkSize: 1000,
        //       chunkOverlap: 200,
        //     });

        //     const docs = await textSplitter.createDocuments(
        //       [cleanedTextContent],
        //       [{ ...url }]
        //     );

        //     const embedder = new OllamaEmbeddings({
        //       model: "nomic-embed-text", // default value
        //       baseUrl: "http://localhost:11434", // default value
        //     });

        //     const client = new QdrantClient({
        //       url: "http://localhost:6333",
        //       port: 6333,
        //     });

        //     await QdrantVectorStore.fromDocuments(docs, embedder, {
        //       collectionName: domain,
        //       client: client,
        //     });

        //     return { ...url, content: cleanedTextContent };
      } catch (e) {
        console.log("error", e);

        return { ...url, content: "" };
      }
    })
  );
  return results;
  // let textData:string;
  // async function fetchTextData (url:string) {
  //   try {
  //     const response = await axios.get(url);
  //     console.log( response.data.slice(0,10))
  //     if (response.status > 299) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     textData =   String(response.data)

  //   } catch (error) {
  //     console.error('Error fetching text data:', error);
  //   }
  // };
  // await fetchTextData("https://weblianz.com")

  // console.log("textData === ", textData.slice(0,10))
  // const dom = new JSDOM(textData)
  // const body = dom.window.document.body;

  // const removeScripts = (node) => {
  //   for (let i = node.childNodes.length - 1; i >= 0; i--) {
  //     const child = node.childNodes[i];
  //     if (
  //       child.nodeName.toLowerCase() === "script" ||
  //       child.nodeName.toLowerCase() === "style"
  //     ) {
  //       child.parentNode.removeChild(child);
  //     } else {
  //       removeScripts(child);
  //     }
  //   }
  // };

  // removeScripts(body);
  // const textContent = body.textContent.trim();
  // const removeEmptyLines = (textContent: string) => {
  //   const lines = textContent.split("\n");
  //   const nonEmptyLines = lines.filter((line) => line.trim());
  //   return nonEmptyLines.join("\n");
  // };

  // const cleanedTextContent = removeEmptyLines(textContent);

  // console.log("cleanedTextContent ==", cleanedTextContent);
  // return [];
}
