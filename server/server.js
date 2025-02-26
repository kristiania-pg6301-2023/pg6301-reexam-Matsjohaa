import express from "express";
import path from "path";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { PostsApi } from "./api/postsApi.js";
import { loginApi } from "./api/loginApi.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const mongoClient = new MongoClient(process.env.MONGODB_URL);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this if missing

mongoClient.connect().then(() => {
  console.log("Connected to MongoDB");
  const db = mongoClient.db("social-media");

  app.use("/api/posts", PostsApi(db));
  app.use("/api/login", loginApi(db));
});

// Must haves
app.use(express.static("../client/dist"));

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
