import { Router } from "express";
import { getCollections } from "./collection.service";
import { addLimit } from "../../utils/rate-limits";

const collectionRouter = Router();

collectionRouter.get("/list", getCollections);

export default collectionRouter;
