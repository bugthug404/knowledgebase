import { Router } from "express";
import { askQdrant, testGenAI } from "./fc.service";

const fcRouter = Router();

fcRouter.get("/test", testGenAI as any);
fcRouter.get("/search", askQdrant as any);

export default fcRouter;
