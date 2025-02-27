import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { MongoClient, ObjectId } from "mongodb"; // Import ObjectId here
import { PostsApi } from "../api/postsApi.js"; // Import the PostsApi router
import express from "express";
import request from "supertest";

describe("PostsApi", () => {
  let db;
  let client;
  let app;

  beforeAll(async () => {
    // Connect to a test database
    client = await MongoClient.connect("mongodb://localhost:27017", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db("test_db");
  });

  beforeEach(async () => {
    // Clear the collections before each test
    await db.collection("posts").deleteMany({});
    await db.collection("userPosts").deleteMany({});

    // Initialize the Express app with the PostsApi router
    app = express();
    app.use(express.json());
    app.use("/posts", PostsApi(db));
  });

 afterAll(async () => {
  if (client) {
    await client.close();
  }
}, 30000); 

  it("should create a new post", async () => {
    const res = await request(app).post("/posts").send({
      title: "Test Post",
      content: "This is a test post.",
      username: "testuser",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Test Post");
    expect(res.body.author).toBe("testuser");
  });

  it("should fetch all posts", async () => {
    // Insert a test post
    await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
    });

    const res = await request(app).get("/posts");

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe("Test Post");
  });

  it("should react to a post", async () => {
    // Insert a test post
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
      reactions: [],
    });

    const res = await request(app)
      .post(`/posts/${post.insertedId}/react`)
      .send({
        emoji: "👍",
        username: "testuser",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reaction updated successfully");

    // Verify the reaction was added
    const updatedPost = await db
      .collection("posts")
      .findOne({ _id: post.insertedId });
    expect(updatedPost.reactions).toContain("testuser:👍");
  });

  it("should update a post", async () => {
    // Insert a test post
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
    });

    const res = await request(app).put(`/posts/${post.insertedId}`).send({
      title: "Updated Post",
      content: "This is an updated post.",
      username: "testuser",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Post updated successfully");

    // Verify the post was updated
    const updatedPost = await db
      .collection("posts")
      .findOne({ _id: post.insertedId });
    expect(updatedPost.title).toBe("Updated Post");
    expect(updatedPost.content).toBe("This is an updated post.");
  });

  it("should delete a post", async () => {
    // Insert a test post
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
    });

    const res = await request(app).delete(`/posts/${post.insertedId}`).send({
      username: "testuser",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Post deleted successfully");

    // Verify the post was deleted
    const deletedPost = await db
      .collection("posts")
      .findOne({ _id: post.insertedId });
    expect(deletedPost).toBeNull();
  });

  it("should fetch posts by username", async () => {
    // Insert a test post
    await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
    });

    const res = await request(app).get("/posts/user/testuser");

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].author).toBe("testuser");
  });

  it("should add a comment to a post", async () => {
    // Insert a test post
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
      comments: [],
    });

    const res = await request(app)
      .post(`/posts/${post.insertedId}/comments`)
      .send({
        author: "commenter",
        content: "This is a comment.",
        provider: "github",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.content).toBe("This is a comment.");

    // Verify the comment was added
    const updatedPost = await db
      .collection("posts")
      .findOne({ _id: post.insertedId });
    expect(updatedPost.comments.length).toBe(1);
    expect(updatedPost.comments[0].content).toBe("This is a comment.");
  });

  it("should delete a comment from a post", async () => {
    // Insert a test post with a comment
    const commentId = new ObjectId(); // Now ObjectId is defined
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
      comments: [
        {
          _id: commentId,
          author: "commenter",
          content: "This is a comment.",
          provider: "github",
          createdAt: new Date(),
        },
      ],
    });

    const res = await request(app)
      .delete(`/posts/${post.insertedId}/comments/${commentId}`)
      .send({
        username: "commenter",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comment deleted successfully");

    // Verify the comment was deleted
    const updatedPost = await db
      .collection("posts")
      .findOne({ _id: post.insertedId });
    expect(updatedPost.comments.length).toBe(0);
  });

  it("should reject post creation with invalid title (too short)", async () => {
    const res = await request(app).post("/posts").send({
      title: "Hi",
      content: "This is a test post.",
      username: "testuser",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title must be between 5 and 100 characters");
  });

  it("should reject post creation with invalid title (too long)", async () => {
    const longTitle = "a".repeat(101);
    const res = await request(app).post("/posts").send({
      title: longTitle,
      content: "This is a test post.",
      username: "testuser",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title must be between 5 and 100 characters");
  });

  it("should reject post creation with invalid content (too short)", async () => {
    const res = await request(app).post("/posts").send({
      title: "Test Post",
      content: "Hi",
      username: "testuser",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "Post content must be between 10 and 1000 characters",
    );
  });

  it("should reject post creation with invalid content (too long)", async () => {
    const longContent = "a".repeat(1001);
    const res = await request(app).post("/posts").send({
      title: "Test Post",
      content: longContent,
      username: "testuser",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "Post content must be between 10 and 1000 characters",
    );
  });

  it("should enforce post creation rate limit", async () => {
    // Create 5 posts to hit the limit
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/posts")
        .send({
          title: `Test Post ${i}`,
          content: "This is a test post.",
          username: "testuser",
        });
    }

    // Attempt to create a 6th post
    const res = await request(app).post("/posts").send({
      title: "Test Post 6",
      content: "This is a test post.",
      username: "testuser",
    });

    expect(res.status).toBe(429);
    expect(res.body.error).toBe("You can only create 5 posts per hour.");
  });

  it("should return 404 when reacting to a non-existent post", async () => {
    const nonExistentPostId = new ObjectId();
    const res = await request(app)
      .post(`/posts/${nonExistentPostId}/react`)
      .send({
        emoji: "👍",
        username: "testuser",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Post not found");
  });

  it("should reject updating a post with an unauthorized user", async () => {
    // Insert a test post
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
    });

    const res = await request(app).put(`/posts/${post.insertedId}`).send({
      title: "Updated Post",
      content: "This is an updated post.",
      username: "unauthorizeduser",
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("You are not authorized to edit this post");
  });

  it("should reject deleting a post with an unauthorized user", async () => {
    // Insert a test post
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
    });

    const res = await request(app).delete(`/posts/${post.insertedId}`).send({
      username: "unauthorizeduser",
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("You are not authorized to delete this post");
  });

  it("should return 404 when fetching a non-existent post", async () => {
    const nonExistentPostId = new ObjectId();
    const res = await request(app).get(`/posts/${nonExistentPostId}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Post not found");
  });

  it("should reject adding a comment with an invalid provider", async () => {
    // Insert a test post
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
      comments: [],
    });

    const res = await request(app)
      .post(`/posts/${post.insertedId}/comments`)
      .send({
        author: "commenter",
        content: "This is a comment.",
        provider: "invalidprovider",
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Only GitHub users can comment");
  });

  it("should return 404 when deleting a non-existent comment", async () => {
    // Insert a test post
    const post = await db.collection("posts").insertOne({
      title: "Test Post",
      content: "This is a test post.",
      author: "testuser",
      createdAt: new Date(),
      comments: [],
    });

    const nonExistentCommentId = new ObjectId();
    const res = await request(app)
      .delete(`/posts/${post.insertedId}/comments/${nonExistentCommentId}`)
      .send({
        username: "commenter",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Comment not found");
  });

  it("should return 404 when fetching comments for a non-existent post", async () => {
    const nonExistentPostId = new ObjectId();
    const res = await request(app).get(`/posts/${nonExistentPostId}/comments`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Post not found");
  });
});
