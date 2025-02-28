import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import {
  PostDetails,
  fetchPostDetails,
  addComment,
  deleteComment,
} from "../pages/postDetails";
import { useParams, useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../utils/loginProvider";
import { Navbar } from "../components/navBar";

// Mock dependencies
vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock("../utils/loginProvider", () => ({
  useLoggedInUser: vi.fn(),
}));

vi.mock("../components/navBar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

// Mock fetch globally
global.fetch = vi.fn();

describe("PostDetails Component", () => {
  const mockPost = {
    _id: "post123",
    title: "Test Post",
    content: "This is a test post.",
    author: "Test Author",
    reactions: ["👍", "❤️"],
    comments: [
      {
        _id: "comment1",
        author: "Commenter 1",
        content: "First comment",
        createdAt: "2023-10-01T12:00:00Z",
      },
      {
        _id: "comment2",
        author: "Commenter 2",
        content: "Second comment",
        createdAt: "2023-10-02T12:00:00Z",
      },
    ],
  };

  const mockLoggedInUser = {
    name: "Test User",
    provider: "github",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParams.mockReturnValue({ postId: "post123" });
    useNavigate.mockReturnValue(vi.fn());
    useLoggedInUser.mockReturnValue({ loggedInUser: mockLoggedInUser });
  });

  test("renders loading state initially", () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Simulate loading
    render(<PostDetails />);

    expect(screen.getByText("Loading post details...")).toBeInTheDocument();
  });

  test("renders post details after loading", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPost),
    });

    render(<PostDetails />);

    await waitFor(() => {
      expect(screen.getByText("Test Post")).toBeInTheDocument();
      expect(screen.getByText("This is a test post.")).toBeInTheDocument();
      // Fix the test by looking for the text content separately or using a regex
      expect(screen.getByText(/Author:/)).toBeInTheDocument();
      expect(screen.getByText("Test Author")).toBeInTheDocument();
      // The same issue might be present for Reactions
      expect(screen.getByText(/Reactions:/)).toBeInTheDocument();
      expect(screen.getByText("👍 ❤️")).toBeInTheDocument();
      expect(screen.getByText("First comment")).toBeInTheDocument();
      expect(screen.getByText("Second comment")).toBeInTheDocument();
    });
  });

  test("renders error message if post fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch post details"));

    render(<PostDetails />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load post details."),
      ).toBeInTheDocument();
    });
  });
  /*
  test("allows GitHub users to add comments", async () => {
    // Mock the initial fetch for post details
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPost),
    });

    // Mock the fetch for adding a comment
    const newCommentResponse = {
      _id: "comment3",
      author: "Test User",
      content: "New comment",
      createdAt: "2023-10-03T12:00:00Z",
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newCommentResponse),
    });

    render(<PostDetails />);

    // Wait for the post details to load
    await waitFor(() => {
      expect(screen.getByText("Test Post")).toBeInTheDocument();
    });

    // Find the comment input and submit button
    const commentInput = screen.getByPlaceholderText("Add a comment...");
    const submitButton = screen.getByText("Submit Comment");

    // Simulate user typing a comment and submitting it
    fireEvent.change(commentInput, { target: { value: "New comment" } });
    fireEvent.click(submitButton);

    // Wait for the add comment fetch call to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/posts/post123/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          author: "Test User",
          content: "New comment",
          provider: "github",
          createdAt: expect.any(String), // Use expect.any(String) to handle dynamic dates
        }),
      });
    });

    // Verify that the new comment is displayed
    await waitFor(() => {
      expect(screen.getByText("New comment")).toBeInTheDocument();
    });
  });*/

  test("prevents non-GitHub users from adding comments", async () => {
    useLoggedInUser.mockReturnValueOnce({
      loggedInUser: { ...mockLoggedInUser, provider: "google" },
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPost),
    });

    render(<PostDetails />);

    await waitFor(() => {
      const commentInput = screen.queryByPlaceholderText("Add a comment...");
      const submitButton = screen.queryByText("Submit Comment");

      expect(commentInput).not.toBeInTheDocument();
      expect(submitButton).not.toBeInTheDocument();
    });
  });

  test("allows comment authors to delete their comments", async () => {
    // Change the logged-in user to match a comment author
    useLoggedInUser.mockReturnValue({
      loggedInUser: { ...mockLoggedInUser, name: "Commenter 1" },
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPost),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<PostDetails />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      expect(fetch).toHaveBeenCalledWith(
        `/api/posts/post123/comments/comment1`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username: "Commenter 1" }), // Update this line too
        },
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("First comment")).not.toBeInTheDocument();
    });
  });

  test("prevents non-authors from deleting comments", async () => {
    useLoggedInUser.mockReturnValueOnce({
      loggedInUser: { ...mockLoggedInUser, name: "Another User" },
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPost),
    });

    render(<PostDetails />);

    await waitFor(() => {
      const deleteButtons = screen.queryAllByText("Delete");
      expect(deleteButtons.length).toBe(0);
    });
  });
});
