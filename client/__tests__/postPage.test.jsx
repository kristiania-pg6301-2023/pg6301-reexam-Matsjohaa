import { render, screen, waitFor } from "@testing-library/react";
import { PostPage } from "../pages/postPage.jsx";
import { fetchJSON } from "../utils/json";
import { Link, useNavigate } from "react-router-dom";

// Mock dependencies
vi.mock("../utils/json", () => ({
  fetchJSON: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: vi.fn(),
}));

vi.mock("../components/navBar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("../components/PostForm", () => ({
  PostForm: () => <div>PostForm</div>,
}));

describe("PostPage Component", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders loading state initially", () => {
    fetchJSON.mockImplementationOnce(() => new Promise(() => {})); // Simulate loading
    render(<PostPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("redirects to login if user is not authenticated", async () => {
    fetchJSON.mockRejectedValueOnce(new Error("Not authenticated"));

    render(<PostPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("renders access denied message for non-GitHub users", async () => {
    fetchJSON.mockResolvedValueOnce({
      email: "test@example.com",
      provider: "google", // Non-GitHub user
    });

    render(<PostPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Access Denied. Only GitHub users can create posts."),
      ).toBeInTheDocument();
      expect(screen.getByText("Go back to the homepage")).toBeInTheDocument();
    });
  });

  test("renders PostForm for GitHub users", async () => {
    fetchJSON.mockResolvedValueOnce({
      email: "test@example.com",
      provider: "github", // GitHub user
    });

    render(<PostPage />);

    await waitFor(() => {
      expect(screen.getByText("Create a New Post")).toBeInTheDocument();
      expect(screen.getByText("PostForm")).toBeInTheDocument();
    });
  });
});
