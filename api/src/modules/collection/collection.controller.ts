import { Router } from "express";
import { getCollections } from "./collection.service";

const collectionRouter = Router();

collectionRouter.get("/list", getCollections);

export default collectionRouter;
