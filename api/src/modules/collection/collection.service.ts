import { Request, Response } from "express";
import { getCollectionList } from "../../utils/get-collections";

export async function getCollections(req: Request, res: Response) {
  try {
    // console.log("sessionId --- ", req.session.id);
    // @ts-ignore
    console.log("sessiong name == ", req.session.name);

    // @ts-ignore
    req.session.name = "name is this";

    // @ts-ignore
    // req.session.cookie = "newnm=cookiethisis";

    const data = await getCollectionList();

    res.status(200).json({ data });
  } catch (error) {
    console.log("getCollections -- ", error);
    res.status(500).json({ error: error.message ?? "Server Error" });
  }
}
