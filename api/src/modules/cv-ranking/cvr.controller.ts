import { Router } from "express";
import {
  getRanking,
  addDocument,
  addPdf,
  getSimilarityScore,
} from "./cvr.service";

const cvrRouter = Router();

cvrRouter.post("/add111", addDocument);
cvrRouter.get("/ask", getRanking);
cvrRouter.post("/add", addPdf);
cvrRouter.post("/score", getSimilarityScore);

export default cvrRouter;
