import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { PostsApi } from "./api/postsApi.js";
import { fetchJSON } from "./utils/jsonUtils.js";
//import { LoginApi } from "./api/loginApi.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const mongoClient = new MongoClient(process.env.MONGODB_URL);

mongoClient.connect().then(() => {
  console.log("Connected do mongodb");
  app.use("/api/posts", PostsApi(mongoClient.db("social-media")));
});

app.use(express.static("../client/dist"));
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
//app.use("api/login", LoginApi());

//login
app.get("api/login", async (req, res) => {
  const { access_token } = req.signedCookies;

  const { userinfo_endpoint } = await fetchJSON(
    "https://accounts.google.com/.well-known/openid-configuration",
  );

  const userinfo = await fetchJSON(userinfo_endpoint, {
    headers: {
      Authorizatrion: `bearer ${access_token}`,
    },
  });
  res.json(userinfo);
});

app.post("api/login", (req, res) => {
  const { access_token } = req.body;
  res.cookie("access_token", access_token, { signed: true });
  res.sendStatus(200);
});

//must haves
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(path.resolve("../client/dist/index.html"));
  } else {
    next();
  }
});

const server = app.listen(PORT, async () => {
  console.log(`Server started on http://localhost:${server.address().port}`);
});
