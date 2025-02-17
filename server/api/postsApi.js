import express from "express";

const hardcodedMenu = [
  {
    title: "Chicken tikka masala",
    description:
      "Chicken tikka masala is a dish consisting of roasted marinated chicken chunks in a spiced sauce.",
  },
  {
    title: "Butter chiken",
    description: "Chicken curry with butter, youghurt and chilli",
  },
  {
    title: "Sushi maki",
    description: "8 pieces of sushi maki with chilli mayo",
  },
];

export function PostsApi(mongoDatabase) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const posts = await mongoDatabase
      .collection("posts")
      .find()
      .map(({ title, description }) => ({ title, description }))
      .toArray();
    const allPosts = hardcodedMenu.concat(posts);

    res.json(allPosts);
  });

  router.post("/", (req, res) => {
    const { title, description } = req.body;
    mongoDatabase.collection("dishes").insertOne({ title, description });
    res.sendStatus(200);
  });

  return router;
}
