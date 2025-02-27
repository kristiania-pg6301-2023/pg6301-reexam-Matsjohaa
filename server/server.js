import express from "express";
import path from "path";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { PostsApi } from "./api/postsApi.js";
import { loginApi } from "./api/loginApi.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("../client/dist"));

// Fallback to index.html for client-side routing
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(path.resolve("../client/dist/index.html"));
  } else {
    next();
  }
});

const startServer = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MongoDB URL is not defined");
  }

  const mongoClient = new MongoClient(process.env.MONGODB_URL);
  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB");
    const db = mongoClient.db("social-media");

    app.use("/api/posts", PostsApi(db));
    app.use("/api/login", loginApi(db));

    const server = app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw new Error("Failed to connect to MongoDB");
  }
};

// Only start the server if this file is run directly (not when imported)
if (process.env.NODE_ENV !== "test") {
  startServer();
}

// Export app and startServer for testing
export { app, startServer };
