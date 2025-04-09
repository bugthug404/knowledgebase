import { Request, Response } from "express";
import { askSohmsChain } from "./functions/gemini/gemini-sohms-chain";
import { ollamaSohmsChain } from "./functions/ollama/ollama-sohms-chain2";
import { ollamaSohmsChat } from "./functions/ollama/ollama-sohms-chain";
import { sohmChain } from "./functions/ollama/sohm-chain";

export async function askSOBot(req: Request, res: Response) {
  console.log("askSOBot document");
  try {
    const { query, collection } = req.query;
    // const collection = "test"

    if (!query || !collection) {
      res
        .status(400)
        .json({ error: "Missing required parameters for this request." });
      return;
    }

    const ans = await sohmChain({
      query: query as string,
      sessionid: req.session.id,
    });

    res
      .send({ ...ans })
      .status(200);
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message ?? "Internal server error" });
  }
}
