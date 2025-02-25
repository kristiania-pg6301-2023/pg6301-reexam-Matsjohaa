import { Router } from "express";
import { ObjectId } from "mongodb";

export const PostsApi = (db) => {
  const router = Router();
  const postsCollection = db.collection("posts");

  router.get("/", async (req, res) => {
    try {
      // Fetch posts sorted by createdAt in descending order (newest first)
      const posts = await postsCollection
        .find()
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .toArray();
      res.json(posts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });
  // Create a new post
  router.post("/", async (req, res) => {
    const { title, content, username } = req.body; // Get title, content, and username from request body

    if (!username) {
      return res
        .status(401)
        .json({ error: "You must be logged in to create a post." });
    }

    // Validate title
    if (!title || title.length < 5 || title.length > 100) {
      return res
        .status(400)
        .json({ error: "Title must be between 5 and 100 characters" });
    }

    // Validate content
    if (!content || content.length < 10 || content.length > 1000) {
      return res
        .status(400)
        .json({ error: "Post content must be between 10 and 1000 characters" });
    }

    const post = {
      title, // Include title in the post object
      content,
      author: username, // Use username from request body
      createdAt: new Date(),
      updatedAt: new Date(),
      reactions: [],
    };

    try {
      const result = await postsCollection.insertOne(post);
      res.status(201).json({ _id: result.insertedId, ...post });
    } catch (err) {
      console.error("Failed to insert post:", err);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  router.post("/:postId/react", async (req, res) => {
    const { postId } = req.params;
    const { emoji, username } = req.body;

    // Ensure the user is logged in, using session or token-based authentication
    if (!username) {
      return res.status(401).json({ error: "You must be logged in to react" });
    }

    try {
      const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: "Post not found" });

      // Ensure the user hasn't already reacted
      if (post.reactions.includes(`${username}:${emoji}`)) {
        return res
          .status(400)
          .json({ error: "You have already reacted with this emoji" });
      }

      // Add the reaction
      await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $push: { reactions: `${username}:${emoji}` } },
      );

      res.status(200).json({ message: "Reaction added successfully" });
    } catch (err) {
      console.error("Failed to react to post:", err);
      res.status(500).json({ error: "Failed to react to post" });
    }
  });

  // Edit a post
  router.put("/:postId", async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const username = req.cookies?.username;

    if (!username) {
      return res
        .status(401)
        .json({ error: "You must be logged in to edit a post" });
    }

    try {
      const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: "Post not found" });

      // Only the author can edit the post
      if (post.author !== username) {
        return res
          .status(403)
          .json({ error: "You are not authorized to edit this post" });
      }

      await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $set: { content, updatedAt: new Date() } },
      );

      res.status(200).json({ message: "Post updated successfully" });
    } catch (err) {
      console.error("Failed to edit post:", err);
      res.status(500).json({ error: "Failed to edit post" });
    }
  });

  // Delete a post
  router.delete("/:postId", async (req, res) => {
    const { postId } = req.params;
    const username = req.cookies?.username;

    if (!username) {
      return res
        .status(401)
        .json({ error: "You must be logged in to delete a post" });
    }

    try {
      const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: "Post not found" });

      // Only the author can delete the post
      if (post.author !== username) {
        return res
          .status(403)
          .json({ error: "You are not authorized to delete this post" });
      }

      await postsCollection.deleteOne({ _id: new ObjectId(postId) });
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
      console.error("Failed to delete post:", err);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  return router;
};
