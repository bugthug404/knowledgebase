import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import documentRouter from "./modules/document/document.controller";
import websiteRouter from "./modules/website/website.controller";
import collectionRouter from "./modules/collection/collection.controller";
import https from "https";
import fs from "fs";
import fcRouter from "./modules/fc/fc.controller";
import cvrRouter from "./modules/cv-ranking/cvr.controller";
import session = require("express-session");
import orgRouter from "./modules/org-chatbot/org.controller";
import vectorRouter from "./modules/vector/vector.controller";

// @ts-ignore
if (typeof PhusionPassenger !== "undefined") {
  // @ts-ignore
  PhusionPassenger.configure({ autoInstall: false });
}

dotenv.config();
const app = express();

const whitelist = ["http://localhost:5173"];
const corsOptions = {
  // origin: (origin, callback) => {
  //   if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("UNAUTHORIZED!"));
  //   }
  // },
  origin: (origin, callback) => {
    callback(null, true); // Allow all origins
  },
  credentials: true,
};

app.use(
  session({
    secret: "abcd1234",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(cors(corsOptions));
// usable on docuemnt upload
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  // @ts-ignore
  req.session.name = "this is session okkkkkk";
  const time = new Date().toLocaleTimeString();
  console.log("get request === ", time);
  res.status(200).send({
    data: `server says : get request on time : ${time}`,
  });
});

app.use("/doc", documentRouter);
app.use("/col", collectionRouter);
app.use("/web", websiteRouter);
app.use("/fc", fcRouter);
app.use("/cvr", cvrRouter);
app.use("/org", orgRouter);
app.use("/vector", vectorRouter);

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
  // @ts-ignore
  if (typeof PhusionPassenger !== "undefined") {
    app.listen("passenger");
  } else {
    app.listen(port, () => {
      console.log(`app started on port http://localhost:${port} `);
    });
  }
}
