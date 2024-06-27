import { Router } from "express";
import { askGfxBot } from "./gfx.service";
import { askSOBot } from "./sacredohms.service";

const orgRouter = Router();

orgRouter.get("/gfx", askGfxBot);
orgRouter.get("/sohms", askSOBot);

export default orgRouter;
