import { Router } from "express";
import { policyLookUpSetup, prepareDB } from "./support-bot.service";
import { fetchUserFlightInformation } from "./tools/flight";

const supportBotRouter = Router();

supportBotRouter.get("/prepare", prepareDB as any);
supportBotRouter.get("/policy-add", policyLookUpSetup as any);
supportBotRouter.get("/flight-info", fetchUserFlightInformation as any);

export default supportBotRouter;
