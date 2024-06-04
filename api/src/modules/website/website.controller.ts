import { Router } from "express";
import { askWebsite, addWebsite, getWebsiteUrls } from "./website.service";
import { pathLog } from "../../utils/path-log";

const websiteRouter = Router();

websiteRouter.post("/add", addWebsite);
websiteRouter.post("/ask", pathLog, askWebsite);
websiteRouter.post("/urls", getWebsiteUrls);

export default websiteRouter;
