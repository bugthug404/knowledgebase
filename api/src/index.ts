import express from "express";
import Cors from "cors";
import dotenv from "dotenv";
import documentRouter from "./modules/document/document.controller";
import websiteRouter from "./modules/website/website.controller";
import collectionRouter from "./modules/collection/collection.controller";
import https from "https";
import fs from "fs";
import supportBotRouter from "./modules/support-bot/support-bot.controller";
import fcRouter from "./modules/fc/fc.controller";
import cvrRouter from "./modules/cv-ranking/cvr.controller";

dotenv.config();
const app = express();

app.use(
  Cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
// usable on docuemnt upload
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  const time = new Date().toLocaleTimeString();
  console.log("get request === ", time);
  res.status(200).send({
    data: `server says : get request on time : ${time}`,
  });
});

app.use("/doc", documentRouter);
app.use("/col", collectionRouter);
app.use("/web", websiteRouter);
app.use("/support-bot", supportBotRouter);
app.use("/fc", fcRouter);
app.use("/cvr", cvrRouter);

const port = process.env.PORT || 3008;

if (process.env.USE_LOCAL_SSL) {
  const httpsOptions = {
    cert: fs.readFileSync("secret/localhost.pem"),
    key: fs.readFileSync("secret/localhost-key.pem"),
  };
  const server = https.createServer(httpsOptions, app);

  server.listen(port, () => {
    console.log(`server started on port https://localhost:${port} `);
  });
} else {
  app.listen(port, () => {
    console.log(`app started on port http://localhost:${port} `);
  });
}
