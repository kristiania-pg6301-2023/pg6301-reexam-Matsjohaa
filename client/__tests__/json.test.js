import { describe, it, expect, vi } from "vitest";
import { fetchJSON } from "../utils/json";

describe("fetchJSON", () => {
  it("should return JSON data on successful fetch", async () => {
    const mockData = { name: "John Doe" };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      }),
    );

    const result = await fetchJSON("/api/test");
    expect(result).toEqual(mockData);
  });

  it("should throw an error on failed fetch", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: () => Promise.resolve("Resource not found"),
      }),
    );

    await expect(fetchJSON("/api/test")).rejects.toThrow(
      "Failed to load 404 Not Found: Resource not found",
    );
  });
});
