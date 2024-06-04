import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { getLLM, getStore } from "./db";
import { ChatPromptTemplate } from "langchain/dist/prompts/chat";
import { pull } from "langchain/hub";

export async function askChain({
  collection,
  query,
}: {
  collection: string;
  query: string;
}) {
  const retriever = (await getStore(collection as string)).asRetriever(3);

  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const ragChain = await createStuffDocumentsChain({
    llm: getLLM(),
    prompt: prompt,
  });

  const retrivedDocs = await retriever.invoke(query as string);

  return ragChain.invoke({
    question: query,
    context: retrivedDocs,
  });
}
