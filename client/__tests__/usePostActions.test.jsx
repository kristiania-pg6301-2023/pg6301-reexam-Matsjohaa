import { renderHook, act } from "@testing-library/react";
import { usePostActions } from "../utils/usePostActions";
import { fetchJSON } from "../utils/json";
import { vi } from "vitest";

// Mock fetchJSON
vi.mock("../utils/json", () => ({
  fetchJSON: vi.fn(),
}));

describe("usePostActions", () => {
  const mockLoggedInUser = { name: "JohnDoe" };
  const mockPosts = [
    { _id: "1", content: "First post", reactions: [] },
    { _id: "2", content: "Second post", reactions: [] },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it("should fetch posts for a specific user", async () => {
    // Mock fetchJSON to return posts
    fetchJSON.mockResolvedValueOnce(mockPosts);

    const { result } = renderHook(() =>
      usePostActions("JohnDoe", mockLoggedInUser),
    );

    // Wait for posts to be fetched
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow useEffect to run
    });

    expect(fetchJSON).toHaveBeenCalledWith("/api/posts/user/JohnDoe");
    expect(result.current.posts).toEqual(mockPosts);
  });

  it("should fetch all posts if no username is provided", async () => {
    // Mock fetchJSON to return posts
    fetchJSON.mockResolvedValueOnce(mockPosts);

    const { result } = renderHook(() => usePostActions(null, mockLoggedInUser));

    // Wait for posts to be fetched
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow useEffect to run
    });

    expect(fetchJSON).toHaveBeenCalledWith("/api/posts");
    expect(result.current.posts).toEqual(mockPosts);
  });

  it("should handle reaction to a post", async () => {
    // Mock fetchJSON for fetching posts and reacting
    fetchJSON.mockResolvedValueOnce(mockPosts); // Initial fetch
    fetchJSON.mockResolvedValueOnce({}); // Reaction success

    const { result } = renderHook(() =>
      usePostActions("JohnDoe", mockLoggedInUser),
    );

    // Wait for posts to be fetched
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow useEffect to run
    });

    // React to a post
    await act(async () => {
      result.current.handleReact("1", "👍");
    });

    // Check if fetchJSON was called correctly
    expect(fetchJSON).toHaveBeenCalledWith("/api/posts/1/react", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji: "👍", username: "JohnDoe" }),
    });

    // Check if the local state was updated
    expect(result.current.posts[0].reactions).toEqual(["JohnDoe:👍"]);
  });

  it("should not allow reaction if user is not logged in", async () => {
    // Mock fetchJSON for fetching posts
    fetchJSON.mockResolvedValueOnce(mockPosts);

    const { result } = renderHook(() => usePostActions("JohnDoe", null));

    // Wait for posts to be fetched
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow useEffect to run
    });

    // Attempt to react to a post
    await act(async () => {
      result.current.handleReact("1", "👍");
    });

    // Check that fetchJSON was not called for reaction
    expect(fetchJSON).not.toHaveBeenCalledWith(
      "/api/posts/1/react",
      expect.anything(),
    );
  });

  it("should delete a post", async () => {
    // Mock fetchJSON for fetching posts and deleting
    fetchJSON.mockResolvedValueOnce(mockPosts); // Initial fetch
    fetchJSON.mockResolvedValueOnce({}); // Delete success

    const { result } = renderHook(() =>
      usePostActions("JohnDoe", mockLoggedInUser),
    );

    // Wait for posts to be fetched
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow useEffect to run
    });

    // Delete a post
    await act(async () => {
      result.current.handleDelete("1");
    });

    // Check if fetchJSON was called correctly
    expect(fetchJSON).toHaveBeenCalledWith("/api/posts/1", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: "JohnDoe" }),
    });

    // Check if the local state was updated
    expect(result.current.posts).toEqual([mockPosts[1]]); // Post with _id "1" should be removed
  });

  it("should not allow deletion if user is not logged in", async () => {
    // Mock fetchJSON for fetching posts
    fetchJSON.mockResolvedValueOnce(mockPosts);

    const { result } = renderHook(() => usePostActions("JohnDoe", null));

    // Wait for posts to be fetched
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow useEffect to run
    });

    // Attempt to delete a post
    await act(async () => {
      result.current.handleDelete("1");
    });

    // Check that fetchJSON was not called for deletion
    expect(fetchJSON).not.toHaveBeenCalledWith(
      "/api/posts/1",
      expect.anything(),
    );
  });

  it("should edit a post", async () => {
    // Mock fetchJSON for fetching posts and editing
    fetchJSON.mockResolvedValueOnce(mockPosts); // Initial fetch
    fetchJSON.mockResolvedValueOnce({}); // Edit success

    const { result } = renderHook(() =>
      usePostActions("JohnDoe", mockLoggedInUser),
    );

    // Wait for posts to be fetched
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow useEffect to run
    });

    // Edit a post
    const updatedPost = { content: "Updated post" };
    await act(async () => {
      result.current.handleEdit("1", updatedPost);
    });

    // Check if fetchJSON was called correctly
    expect(fetchJSON).toHaveBeenCalledWith("/api/posts/1", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...updatedPost, username: "JohnDoe" }),
    });

    // Check if the local state was updated
    expect(result.current.posts[0].content).toEqual("Updated post");
  });

  it("should not allow editing if user is not logged in", async () => {
    // Mock fetchJSON for fetching posts
    fetchJSON.mockResolvedValueOnce(mockPosts);

    const { result } = renderHook(() => usePostActions("JohnDoe", null));

    // Wait for posts to be fetched
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow useEffect to run
    });

    // Attempt to edit a post
    await act(async () => {
      result.current.handleEdit("1", { content: "Updated post" });
    });

    // Check that fetchJSON was not called for editing
    expect(fetchJSON).not.toHaveBeenCalledWith(
      "/api/posts/1",
      expect.anything(),
    );
  });
});
