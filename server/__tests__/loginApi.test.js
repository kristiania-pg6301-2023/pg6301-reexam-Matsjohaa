import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import { loginApi } from "./api/loginApi.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { fetchJSON } from "../utils/jsonUtils.js";
import cookieParser from "cookie-parser";
dotenv.config();

// Mock node-fetch and other modules as needed
vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

vi.mock("../utils/jsonUtils.js", () => ({
  fetchJSON: vi.fn(),
}));

// Mock cookie-parser
vi.mock("cookie-parser", () => ({
  default: () => (req, res, next) => {
    req.signedCookies = { access_token: "valid_google_token" }; // Default mock value
    next();
  },
}));

describe("loginApi", () => {
  let app;
  let db;
  let mockResponse;
  let mockJsonPromise;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser(process.env.COOKIE_SECRET));

    // Reset mocks
    db = {
      collection: vi.fn().mockReturnThis(),
      findOne: vi.fn(),
      insertOne: vi.fn(),
    };

    // Setup fetchJSON mock - fixed the await issue
    fetchJSON.mockImplementation((url) => {
      if (
        url === "https://accounts.google.com/.well-known/openid-configuration"
      ) {
        return Promise.resolve({
          userinfo_endpoint: "https://accounts.google.com/oauth2/v3/userinfo",
        });
      }
      return Promise.reject(new Error("Invalid URL"));
    });

    // Setup fetch mock
    mockJsonPromise = vi.fn();
    mockResponse = {
      ok: true,
      json: mockJsonPromise,
      status: 200,
      statusText: "OK",
    };
    fetch.mockResolvedValue(mockResponse);

    app.use(loginApi(db));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return login config", async () => {
    const response = await request(app).get("/config");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      google_client_id: process.env.GOOGLE_CLIENT_ID,
      google_discovery_endpoint:
        "https://accounts.google.com/.well-known/openid-configuration",
      github_client_id: process.env.GITHUB_CLIENT_ID,
      response_type: "token",
    });
  });

  it("should handle missing GitHub code", async () => {
    const response = await request(app).post("/github").send({});
    expect(response.status).toBe(400);
    expect(response.text).toBe("No authorization code provided");
  });

  it("should handle GitHub API error", async () => {
    fetch.mockRejectedValue(new Error("Network error"));

    const response = await request(app)
      .post("/github")
      .send({ code: "test-code" });

    expect(response.status).toBe(500);
    expect(response.text).toBe("Internal Server Error");
  });

  it("should clear access token cookie on logout", async () => {
    const response = await request(app).delete("/");
    expect(response.status).toBe(200);
  });

  // Additional tests for more coverage

  it("should return user info for a valid Google access token", async () => {
    const mockGoogleUser = {
      name: "Google User",
      email: "googleuser@example.com",
      picture: "image_url",
    };
    const mockUserinfo = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockGoogleUser),
    };
    fetch.mockResolvedValueOnce(mockUserinfo); // Mock Google API response

    const mockGoogleResponse = {
      userinfo_endpoint: "https://accounts.google.com/oauth2/v3/userinfo",
    };
    fetchJSON.mockResolvedValueOnce(mockGoogleResponse);

    // Mock signed cookie with an access token
    const response = await request(app)
      .get("/")
      .set("Cookie", ["access_token=valid_google_token; signed=true"]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...mockGoogleUser, provider: "google" });
  });

  it("should return 500 if GitHub user info fetch fails", async () => {
    const mockGithubUserInfo = {
      userinfo_endpoint: "https://api.github.com/user",
    };
    fetchJSON.mockResolvedValueOnce(mockGithubUserInfo);

    const mockGithubResponse = { ok: false, status: 404 };
    fetch.mockResolvedValueOnce(mockGithubResponse);

    const response = await request(app).get("/");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Internal Server Error");
  });

  it("should handle missing access token during /github login", async () => {
    const response = await request(app).post("/github").send({});
    expect(response.status).toBe(400);
    expect(response.text).toBe("No authorization code provided");
  });

  it("should handle GitHub OAuth failure (error in GitHub response)", async () => {
    const mockErrorResponse = {
      error: "invalid_request",
      error_description: "Invalid code",
    };
    fetch.mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValue(mockErrorResponse),
    });

    const response = await request(app)
      .post("/github")
      .send({ code: "invalid-code" });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Invalid code");
  });
});
