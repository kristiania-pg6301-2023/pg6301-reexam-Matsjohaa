import { describe, it, expect, vi, beforeEach } from "vitest";
import { app, startServer } from "./server.js";
import { MongoClient } from "mongodb";

// Mock MongoDB
vi.mock("mongodb", () => ({
  MongoClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(null), // Ensure connect resolves
    db: vi.fn().mockReturnValue({
      collection: vi.fn(), // Mock the collection method
    }),
  })),
}));

describe("Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start the server and connect to MongoDB", async () => {
    process.env.MONGODB_URL = "mongodb://localhost:27017";
    process.env.PORT = "5000";

    // Mock the app.listen method
    const mockListen = vi.fn().mockImplementation((port, callback) => {
      callback(); // Call the callback to simulate server startup
      return { close: vi.fn() }; // Return a mock server object with a close method
    });
    app.listen = mockListen;

    await startServer();

    // Assertions
    expect(MongoClient).toHaveBeenCalledWith(process.env.MONGODB_URL);
    expect(mockListen).toHaveBeenCalledWith(
      Number(process.env.PORT),
      expect.any(Function),
    );
  });

  it("should throw an error if MongoDB URL is not defined", async () => {
    delete process.env.MONGODB_URL;
    await expect(startServer()).rejects.toThrow("MongoDB URL is not defined");
  });
});
