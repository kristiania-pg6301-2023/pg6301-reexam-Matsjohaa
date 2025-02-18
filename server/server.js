import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { PostsApi } from "./api/postsApi.js";
import { fetchJSON } from "./utils/jsonUtils.js";
//import { LoginApi } from "./api/loginApi.js";
import fetch from "node-fetch";

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

//app.use("api/login", LoginApi());

//login

app.use("api/login", loginApi);

app.use(cookieParser(process.env.COOKIE_SECRET));

const discoveryEndpoint =
  "https://accounts.google.com/.well-known/openid-configuration";

app.get("/api/config", (req, res) => {
  res.json({
    client_id: process.env.GOOGLE_CLIENT_ID,
    discovery_endpoint: discoveryEndpoint,
    response_type: "token",
  });
});

app.get("/api/login", async (req, res) => {
  const { access_token } = req.signedCookies;

  if (!access_token) {
    console.log("No access token found in cookies");
    return res.sendStatus(401); // Unauthorized
  }

  try {
    const { userinfo_endpoint } = await fetchJSON(discoveryEndpoint);
    const userinfo = await fetch(userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userinfo.ok) {
      console.log(
        `Failed to fetch user info: ${userinfo.status} ${userinfo.statusText}`,
      );
      return res.sendStatus(500);
    }

    res.json(await userinfo.json());
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.sendStatus(500);
  }
});
app.post("/api/login", (req, res) => {
  const { access_token } = req.body;
  res.cookie("access_token", access_token, { signed: true });
  res.sendStatus(200);
});

app.delete("/api/login", (req, res) => {
  res.clearCookie("access_token");
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
