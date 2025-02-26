import cookieParser from "cookie-parser";
import { fetchJSON } from "../utils/jsonUtils.js";
import fetch from "node-fetch";
import { Router } from "express";
import dotenv from "dotenv";

export const loginApi = (db) => {
  const router = new Router();

  dotenv.config();
  router.use(cookieParser(process.env.COOKIE_SECRET));

  const googleDiscoveryEndpoint =
    "https://accounts.google.com/.well-known/openid-configuration";

  router.get("/config", (req, res) => {
    res.json({
      google_client_id: process.env.GOOGLE_CLIENT_ID,
      google_discovery_endpoint: googleDiscoveryEndpoint,
      github_client_id: process.env.GITHUB_CLIENT_ID,
      response_type: "token",
    });
  });

  router.get("/", async (req, res) => {
    const { access_token } = req.signedCookies;

    if (!access_token) {
      return res.sendStatus(401); // Unauthorized
    }

    try {
      const { userinfo_endpoint } = await fetchJSON(googleDiscoveryEndpoint);
      const userinfo = await fetch(userinfo_endpoint, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (userinfo.ok) {
        const googleUser = await userinfo.json();

        const existingUser = await db.collection("users").findOne({
          email: googleUser.email,
        });

        if (!existingUser) {
          await db.collection("users").insertOne({
            name: googleUser.name,
            email: googleUser.email,
            picture: googleUser.picture,
            provider: "google",
            createdAt: new Date(),
          });
        }

        return res.json({ ...googleUser, provider: "google" });
      }

      const githubUserInfo = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!githubUserInfo.ok) {
        console.log(
          `Failed to fetch user info: ${githubUserInfo.status} ${githubUserInfo.statusText}`,
        );
        return res.sendStatus(500);
      }

      const githubUser = await githubUserInfo.json();

      const existingUser = await db.collection("users").findOne({
        email:
          githubUser.email || `${githubUser.login}@users.noreply.github.com`,
      });

      if (!existingUser) {
        await db.collection("users").insertOne({
          name: githubUser.name || githubUser.login,
          email:
            githubUser.email || `${githubUser.login}@users.noreply.github.com`,
          picture: githubUser.avatar_url,
          provider: "github",
          createdAt: new Date(),
        });
      }

      res.json({
        name: githubUser.name || githubUser.login,
        email:
          githubUser.email || `${githubUser.login}@users.noreply.github.com`,
        picture: githubUser.avatar_url,
        provider: "github",
      });
    } catch (err) {
      console.error("Error fetching user info:", err);
      res.sendStatus(500);
    }
  });

  router.post("/", (req, res) => {
    const { access_token } = req.body;
    res.cookie("access_token", access_token, { signed: true });
    res.sendStatus(200);
  });

  router.post("/github", async (req, res) => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).send("No authorization code provided");
    }

    try {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        },
      );

      const data = await response.json();
      if (data.error) {
        return res.status(400).send(data.error_description);
      }

      res.cookie("access_token", data.access_token, { signed: true });
      res.sendStatus(200);
    } catch (err) {
      console.error("Error during GitHub login:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  router.delete("/", (req, res) => {
    res.clearCookie("access_token");
    res.sendStatus(200);
  });

  return router;
};
