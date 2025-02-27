import { describe, it, expect, vi } from "vitest";
import { fetchJSON } from "../utils/jsonUtils.js";

// Mocking fetch globally
global.fetch = vi.fn();
describe("fetchJSON", () => {
  it("should return JSON data when fetch is successful", async () => {
    const mockResponse = { data: "some data" };

    // Mock a successful response for fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse), // Simulate JSON data return
    });

    const result = await fetchJSON("https://api.example.com");
    expect(result).toEqual(mockResponse); // Check if the returned data matches
    expect(fetch).toHaveBeenCalledWith("https://api.example.com", {
      method: "GET",
    }); // Check if fetch was called correctly
  });

  it("should throw an error when fetch fails with a non-2xx status", async () => {
    // Mock a failed response with status 500
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    // Expect the fetchJSON function to throw an error with the status code
    await expect(fetchJSON("https://api.example.com")).rejects.toThrow(
      "Failed 500",
    );
  });

  it("should throw an error when fetch throws an exception (network error)", async () => {
    // Mock a rejected fetch (simulating network failure)
    const networkError = new Error(
      "request to https://api.example.com/ failed, reason: getaddrinfo ENOTFOUND api.example.com",
    );
    fetch.mockRejectedValueOnce(networkError);

    // Expect the fetchJSON function to throw a network error message
    await expect(fetchJSON("https://api.example.com")).rejects.toThrowError(
      /request to https:\/\/api.example.com\/ failed, reason: getaddrinfo ENOTFOUND api.example.com/,
    );
  });
});
