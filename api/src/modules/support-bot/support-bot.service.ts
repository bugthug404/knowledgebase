import { addToStore } from "../../utils/db";
import { fixTiming } from "./prepare-db";
import fs from "fs";
export async function prepareDB(req: Request, res: Response) {
  try {
    await fixTiming();
    (res as any).status(200).send({
      data: `DB prepared`,
    });
  } catch (error) {
    (res as any).status(500).send({
      error: error.message ?? "Internal server error",
    });
  }
}

export async function policyLookUpSetup(req: Request, res: Response) {
  try {
    const policies = fs.readFileSync("swiss_faq.md", "utf-8");

    console.log("policies --- ", policies.substring(0, 100));

    await addToStore("policies", policies);

    (res as any).status(200).send({
      data: `Plicy lookup ready.`,
    });
  } catch (error) {
    (res as any).status(500).send({
      error: error.message ?? "Internal server error",
    });
  }
}
