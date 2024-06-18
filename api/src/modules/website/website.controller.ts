import { Router } from "express";
import { askWebsite, addWebsite, getWebsiteUrls } from "./website.service";
import { pathLog } from "../../utils/path-log";
import { askChainCustom } from "../../utils/ask-chain";

const websiteRouter = Router();

websiteRouter.post("/add", addWebsite);
websiteRouter.post("/ask", pathLog, askChainCustom);
websiteRouter.post("/urls", getWebsiteUrls);

export default websiteRouter;
