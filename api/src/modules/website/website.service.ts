import { Request, Response } from "express";

import { extractWebsiteUrl } from "./utils/extract-website-urls";
import { PlaywrightCrawler } from "crawlee";
import { checkExistingCollection } from "../../utils/get-collections";
import { askChain, askChainCustom } from "../../utils/ask-chain";

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
    } catch (error) {
      const urlo = new URL("http://" + url);
      webUrl = urlo.href;
      domain = urlo.hostname;
    }

    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(domain)) {
      return res.status(400).json({ error: "invalid url format" });
    }

    // const domain = new URL(webUrl).hostname;

    // try {
    //   await checkExistingCollection(collectionName);
    //   // console.log(searchResult);
    //   return res.status(400).json({
    //     error: "this domain already added. try recreate to add again.",
    //   });
    // } catch (err) {
    //   // nothing to do here
    // }

    await extractWebsiteUrl(webUrl, domain, collectionName);

    res.json({ status: "data uploaded successfully" }).status(200);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}

export async function askWebsite(req: Request, res: Response) {
  try {
    console.log("ask website", req.body);
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

export async function askWebsiteCustom(req: Request, res: Response) {
  try {
    const { query, collection } = req.query;
    const domain = req.body?.domain;

    if (!query || !domain) {
      res
        .json({ error: "Missing required parameters for this request." })
        .status(400);
      return;
    }

    const ans = await askChainCustom({
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
