import { Router } from "express";
import { ObjectId } from "mongodb";
import { isAuthenticated, isGitHubUser } from "../controller/middleware.js";

export const PostsApi = (db) => {
  const router = Router();
  const postsCollection = db.collection("posts");

  // Create a new post (open to everyone)
  router.post("/", async (req, res) => {
    console.log("Received request body:", req.body); // Debugging log

    const { content } = req.body;
    const author = req.cookies?.username || "Anonymous";

    if (!content || content.length < 10 || content.length > 1000) {
      return res
        .status(400)
        .json({ error: "Post content must be between 10 and 1000 characters" });
    }

    const post = {
      content,
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
      reactions: [],
    };

    try {
      const result = await postsCollection.insertOne(post);
      res.status(201).json({ id: result.insertedId, ...post });
    } catch (err) {
      console.error("Failed to insert post:", err);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Edit a post (only GitHub users and the author)
  router.put("/:id", isAuthenticated, isGitHubUser, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const author = req.cookies?.username; // Get username from cookies

    if (!content || content.length < 10 || content.length > 1000) {
      return res
        .status(400)
        .json({ error: "Post content must be between 10 and 1000 characters" });
    }

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!author || post.author !== author) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this post" });
    }

    const updatedPost = {
      ...post,
      content,
      updatedAt: new Date(),
    };

    await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedPost },
    );
    res.status(200).json(updatedPost);
  });

  return router;
};
