import express from "express";
import Cors from "cors";
import dotenv from "dotenv";
import documentRouter from "./modules/document/document.controller";
import websiteRouter from "./modules/website/website.controller";
import collectionRouter from "./modules/collection/collection.controller";
import https from "https";
import fs from "fs";

dotenv.config();
const app = express();

const httpsOptions = {
  cert: fs.readFileSync("secret/localhost.pem"),
  key: fs.readFileSync("secret/localhost-key.pem"),
};
const server = https.createServer(httpsOptions, app);

const port = process.env.PORT || 3008;

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

if (process.env.USE_LOCAL_RESOURCES) {
  server.listen(port, () => {
    console.log(`server started on port https://localhost:${port} `);
  });
} else {
  app.listen(port, () => {
    console.log(`app started on port http://localhost:${port} `);
  });
}
