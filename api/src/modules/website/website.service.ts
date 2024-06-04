import { Request, Response } from "express";

import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Ollama } from "@langchain/community/llms/ollama";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "langchain/prompts";
import { pull } from "langchain/hub";
import { extractWebsiteUrl } from "./utils/extract-website-urls";
import { PlaywrightCrawler } from "crawlee";
import { getTextFromUrls } from "./utils/get-text-from-urls";
import { checkExistingCollection } from "../../utils/get-collections";
import { askChain } from "../../utils/ask-chain";

export async function getWebsiteUrls(req: Request, res: Response) {
  try {
    const webUrl = req.body.url;

    if (!webUrl) {
      return res.status(400).json({
        error: "url is required",
      });
    }

    const urls: string[] = [];
    const crawler = new PlaywrightCrawler({
      async requestHandler({ request, enqueueLinks }) {
        if (request.loadedUrl.endsWith(".webp")) return;
        console.log(request.loadedUrl);
        urls.push(request.loadedUrl);

        await enqueueLinks({});
      },
      maxConcurrency: 10,
    });

    await crawler.run([webUrl]);

    // return urls;
    console.log(urls, urls.length);

    return res.send({ urls }).status(200);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}

export async function addWebsite(req: Request, res: Response) {
  try {
    const { url, collectionName } = req.body;
    if (!url) {
      return res.status(400).json({
        error: "url is required",
      });
    }
    let domain: string;
    let webUrl: string = url;

    try {
      const urlo = new URL(url);
      webUrl = urlo.href;
      domain = urlo.hostname;
      console.log("domain -- ", domain, webUrl);
    } catch (error) {
      const urlo = new URL("http://" + url);
      webUrl = urlo.href;
      domain = urlo.hostname;
      console.log("domain2 -- ", domain, webUrl);
    }

    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(domain)) {
      return res.status(400).json({ error: "invalid url format" });
    }

    // const domain = new URL(webUrl).hostname;

    try {
      await checkExistingCollection(collectionName);
      // console.log(searchResult);
      return res.status(400).json({
        error: "this domain already added. try recreate to add again.",
      });
    } catch (err) {
      // nothing to do here
    }

    await extractWebsiteUrl(webUrl, domain, collectionName);

    res.json({ status: "data uploaded successfully" }).status(200);
  } catch (error: any) {
    console.error(error);
    return res
      .json({ error: error.message ?? "Internal server error" })
      .status(500);
  }
}

export async function askWebsite(req: Request, res: Response) {
  try {
    const GAPIKEY = process.env.GOOGLE_AI_API_KEY;
    const { query, collection, model = "gemma:2b" } = req.query;
    const collectionName = req.body?.domain;
    console.log("ask website", query, model, collectionName);

    if (!query || !model || !collectionName) {
      res
        .json({ error: "Missing required parameters for this request." })
        .status(400);
      return;
    }

    const ans = await askChain({
      collection: collection as string,
      query: query as string,
    });

    res.status(200).json({ data: ans });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
