import cookieParser from "cookie-parser";
import { fetchJSON } from "../utils/jsonUtils.js";
import fetch from "node-fetch";
import { Router } from "express";
import dotenv from "dotenv";

export const loginApi = new Router();

dotenv.config();
loginApi.use(cookieParser(process.env.COOKIE_SECRET));

const discoveryEndpoint =
  "https://accounts.google.com/.well-known/openid-configuration";

loginApi.get("/config", (req, res) => {
  res.json({
    client_id: process.env.GOOGLE_CLIENT_ID,
    discovery_endpoint: discoveryEndpoint,
    response_type: "token",
  });
});

loginApi.get("/login", async (req, res) => {
  const { access_token } = req.signedCookies;

  if (!access_token) {
    console.log("No access token found in cookies");
    return res.sendStatus(401); // Unauthorized
  }

  try {
    const { userinfo_endpoint } = await fetchJSON(discoveryEndpoint);
    const userinfo = await fetch(userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`, // FIXED: Missing backticks
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
loginApi.post("/login", (req, res) => {
  const { access_token } = req.body;
  res.cookie("access_token", access_token, { signed: true });
  res.sendStatus(200);
});

loginApi.delete("/login", (req, res) => {
  res.clearCookie("access_token");
  res.sendStatus(200);
});
