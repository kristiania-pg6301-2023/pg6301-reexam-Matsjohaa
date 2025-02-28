import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PostForm } from "../components/postForm.jsx";
import { useLoggedInUser } from "../utils/loginProvider";
import { useNavigate } from "react-router-dom";

// Mock the hooks
vi.mock("../utils/loginProvider", () => ({
  useLoggedInUser: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();
global.alert = vi.fn();

describe("PostForm Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    // Default mock implementation
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "123",
        title: "Test Title",
        content: "Test Content",
      }),
    });
  });

  it("should render loading state when loadingUser is true", () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: null,
      loadingUser: true,
    });

    render(<PostForm />);
    expect(screen.getByText("Loading user...")).toBeInTheDocument();
  });

  it("should render the form when user is loaded", () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: { name: "testuser" },
      loadingUser: false,
    });

    render(<PostForm />);
    expect(
      screen.getByPlaceholderText("Enter post title (5-100 characters)"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Write your post content (10-1000 characters)",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeInTheDocument();
  });

  it("should update title and content state when inputs change", () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: { name: "testuser" },
      loadingUser: false,
    });

    render(<PostForm />);

    const titleInput = screen.getByPlaceholderText(
      "Enter post title (5-100 characters)",
    );
    const contentInput = screen.getByPlaceholderText(
      "Write your post content (10-1000 characters)",
    );

    fireEvent.change(titleInput, { target: { value: "New Test Title" } });
    fireEvent.change(contentInput, {
      target: { value: "New Test Content that is long enough" },
    });

    expect(titleInput.value).toBe("New Test Title");
    expect(contentInput.value).toBe("New Test Content that is long enough");
  });

  it("should show alert when title is too short", async () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: { name: "testuser" },
      loadingUser: false,
    });

    render(<PostForm />);

    const titleInput = screen.getByPlaceholderText(
      "Enter post title (5-100 characters)",
    );
    const contentInput = screen.getByPlaceholderText(
      "Write your post content (10-1000 characters)",
    );
    const submitButton = screen.getByText("Post");

    fireEvent.change(titleInput, { target: { value: "Hi" } }); // Too short
    fireEvent.change(contentInput, {
      target: { value: "This is a valid content for the post." },
    });
    fireEvent.click(submitButton);

    expect(global.alert).toHaveBeenCalledWith(
      "Title must be between 5 and 100 characters.",
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should show alert when content is too short", async () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: { name: "testuser" },
      loadingUser: false,
    });

    render(<PostForm />);

    const titleInput = screen.getByPlaceholderText(
      "Enter post title (5-100 characters)",
    );
    const contentInput = screen.getByPlaceholderText(
      "Write your post content (10-1000 characters)",
    );
    const submitButton = screen.getByText("Post");

    fireEvent.change(titleInput, { target: { value: "Valid Title" } });
    fireEvent.change(contentInput, { target: { value: "Too short" } }); // Too short
    fireEvent.click(submitButton);

    expect(global.alert).toHaveBeenCalledWith(
      "Post content must be between 10 and 1000 characters.",
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should show alert when user is not logged in", async () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: null, // Not logged in
      loadingUser: false,
    });

    render(<PostForm />);

    const titleInput = screen.getByPlaceholderText(
      "Enter post title (5-100 characters)",
    );
    const contentInput = screen.getByPlaceholderText(
      "Write your post content (10-1000 characters)",
    );
    const submitButton = screen.getByText("Post");

    fireEvent.change(titleInput, { target: { value: "Valid Title" } });
    fireEvent.change(contentInput, {
      target: { value: "This is a valid content for the post." },
    });
    fireEvent.click(submitButton);

    expect(global.alert).toHaveBeenCalledWith(
      "You must be logged in to create a post.",
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should submit the form successfully when inputs are valid and user is logged in", async () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: { name: "testuser" },
      loadingUser: false,
    });

    render(<PostForm />);

    const titleInput = screen.getByPlaceholderText(
      "Enter post title (5-100 characters)",
    );
    const contentInput = screen.getByPlaceholderText(
      "Write your post content (10-1000 characters)",
    );
    const submitButton = screen.getByText("Post");

    fireEvent.change(titleInput, { target: { value: "Valid Test Title" } });
    fireEvent.change(contentInput, {
      target: {
        value: "This is a valid content for testing the post form submission.",
      },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Valid Test Title",
          content:
            "This is a valid content for testing the post form submission.",
          username: "testuser",
        }),
        credentials: "include",
      });

      expect(global.alert).toHaveBeenCalledWith("Post created successfully!");
      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(titleInput.value).toBe("");
      expect(contentInput.value).toBe("");
    });
  });

  it("should handle rate limiting (429) response", async () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: { name: "testuser" },
      loadingUser: false,
    });

    // Mock a 429 response
    global.fetch.mockResolvedValue({
      ok: false,
      status: 429,
    });

    render(<PostForm />);

    const titleInput = screen.getByPlaceholderText(
      "Enter post title (5-100 characters)",
    );
    const contentInput = screen.getByPlaceholderText(
      "Write your post content (10-1000 characters)",
    );
    const submitButton = screen.getByText("Post");

    fireEvent.change(titleInput, { target: { value: "Valid Test Title" } });
    fireEvent.change(contentInput, {
      target: {
        value: "This is a valid content for testing the post form submission.",
      },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "You can only create 5 posts per hour.",
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("should handle fetch error during submission", async () => {
    useLoggedInUser.mockReturnValue({
      loggedInUser: { name: "testuser" },
      loadingUser: false,
    });

    // Mock a generic error response
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<PostForm />);

    const titleInput = screen.getByPlaceholderText(
      "Enter post title (5-100 characters)",
    );
    const contentInput = screen.getByPlaceholderText(
      "Write your post content (10-1000 characters)",
    );
    const submitButton = screen.getByText("Post");

    fireEvent.change(titleInput, { target: { value: "Valid Test Title" } });
    fireEvent.change(contentInput, {
      target: {
        value: "This is a valid content for testing the post form submission.",
      },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Failed to create post. Please try again.",
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
