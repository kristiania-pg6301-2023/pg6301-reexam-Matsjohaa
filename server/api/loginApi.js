import cookieParser from "cookie-parser";
import { fetchJSON } from "../utils/jsonUtils.js";
import fetch from "node-fetch";
import { Router } from "express";
import dotenv from "dotenv";

export const loginApi = new Router();

dotenv.config();
loginApi.use(cookieParser(process.env.COOKIE_SECRET));

const googleDiscoveryEndpoint =
  "https://accounts.google.com/.well-known/openid-configuration";

// Endpoint to provide configuration for both Google and GitHub
loginApi.get("/config", (req, res) => {
  res.json({
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_discovery_endpoint: googleDiscoveryEndpoint,
    github_client_id: process.env.GITHUB_CLIENT_ID,
    response_type: "token",
  });
});

// Endpoint to fetch user info (works for both Google and GitHub)
loginApi.get("/login", async (req, res) => {
  const { access_token } = req.signedCookies;

  if (!access_token) {
    console.log("No access token found in cookies");
    return res.sendStatus(401); // Unauthorized
  }

  try {
    // Try fetching Google user info first
    const { userinfo_endpoint } = await fetchJSON(googleDiscoveryEndpoint);
    const userinfo = await fetch(userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (userinfo.ok) {
      return res.json(await userinfo.json());
    }

    // If Google user info fails, try fetching GitHub user info
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
    res.json({
      name: githubUser.name || githubUser.login,
      email: githubUser.email || `${githubUser.login}@users.noreply.github.com`,
      picture: githubUser.avatar_url,
    });
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.sendStatus(500);
  }
});

// Endpoint to handle Google login callback
loginApi.post("/login", (req, res) => {
  const { access_token } = req.body;
  res.cookie("access_token", access_token, { signed: true });
  res.sendStatus(200);
});

// Endpoint to handle GitHub login callback
loginApi.post("/github/login", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send("No authorization code provided");
  }

  try {
    // Exchange the code for an access token
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

    // Store the access token in a cookie
    res.cookie("access_token", data.access_token, { signed: true });
    res.sendStatus(200);
  } catch (err) {
    console.error("Error during GitHub login:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to log out
loginApi.delete("/login", (req, res) => {
  res.clearCookie("access_token");
  res.sendStatus(200);
});
