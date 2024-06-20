import { Router } from "express";
import { askQdrant, asking, testGenAI } from "./fc.service";

const fcRouter = Router();

fcRouter.get("/test", testGenAI as any);
fcRouter.get("/search", askQdrant as any);
fcRouter.get("/ask", asking as any);

export default fcRouter;
