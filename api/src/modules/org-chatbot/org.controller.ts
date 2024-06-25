import { Router } from "express";
import { askGfxBot } from "./gfx.service";

const orgRouter = Router();

orgRouter.get("/add", askGfxBot);

export default orgRouter;
