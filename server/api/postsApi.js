import { Router } from "express";
import { ObjectId } from "mongodb";

export const PostsApi = (db) => {
  const router = Router();
  const postsCollection = db.collection("posts");
  const userPostsCollection = db.collection("userPosts");

  const checkPostLimit = async (username) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // Timestamp for 1 hour ago
    const userPosts = await userPostsCollection
      .find({
        username,
        createdAt: { $gte: oneHourAgo }, // Find posts created in the last hour
      })
      .toArray();

    return userPosts.length >= 5; // Return true if the user has 5 or more posts in the last hour
  };

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
  // Create a new post
  router.post("/", async (req, res) => {
    const { title, content, username } = req.body;

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

    // Check if the user has exceeded the post limit
    const hasExceededLimit = await checkPostLimit(username);
    if (hasExceededLimit) {
      return res
        .status(429)
        .json({ error: "You can only create 5 posts per hour." });
    }

    const post = {
      title,
      content,
      author: username,
      createdAt: new Date(),
      updatedAt: new Date(),
      reactions: [],
    };

    try {
      // Insert the new post
      const result = await postsCollection.insertOne(post);

      // Track the post in the userPosts collection
      await userPostsCollection.insertOne({
        username,
        postId: result.insertedId,
        createdAt: new Date(),
      });

      res.status(201).json({ _id: result.insertedId, ...post });
    } catch (err) {
      console.error("Failed to insert post:", err);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  router.post("/:postId/react", async (req, res) => {
    const { postId } = req.params;
    const { emoji, username } = req.body;

    if (!username) {
      return res.status(401).json({ error: "You must be logged in to react" });
    }

    try {
      const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
      if (!post) return res.status(404).json({ error: "Post not found" });

      // Remove the user's existing reaction (if any)
      const updatedReactions = post.reactions.filter(
        (reaction) => !reaction.startsWith(`${username}:`),
      );

      // Add the new reaction
      updatedReactions.push(`${username}:${emoji}`);

      // Update the post with the new reactions
      await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $set: { reactions: updatedReactions } },
      );

      res.status(200).json({ message: "Reaction updated successfully" });
    } catch (err) {
      console.error("Failed to react to post:", err);
      res.status(500).json({ error: "Failed to react to post" });
    }
  });

  // Edit a post
  router.put("/:postId", async (req, res) => {
    const { postId } = req.params;
    const { title, content, username } = req.body; // Get username from the request body

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
        { $set: { title, content, updatedAt: new Date() } }, // Update title and content
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
    const { username } = req.body; // Get username from the request body

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

  router.get("/user/:username", async (req, res) => {
    const { username } = req.params;

    try {
      const posts = await postsCollection
        .find({ author: username }) // Find posts by the specified author
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
        .toArray();

      res.status(200).json(posts);
    } catch (err) {
      console.error("Failed to fetch user posts:", err);
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  });

  return router;
};
