import { render, screen, fireEvent } from "@testing-library/react";
import { Post } from "../components/post";
import { useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../utils/loginProvider";
import { vi } from "vitest";

// Mock useNavigate and useLoggedInUser
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../utils/loginProvider", () => ({
  useLoggedInUser: vi.fn(),
}));

describe("Post", () => {
  const mockPost = {
    _id: "1",
    title: "Test Post",
    content: "This is a test post.",
    author: "JohnDoe",
    reactions: [],
  };

  const mockOnDelete = vi.fn();
  const mockOnReact = vi.fn();
  const mockOnEdit = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("should render reaction buttons when user is logged in", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: { name: "JaneDoe" } });

    render(
      <Post
        post={mockPost}
        onDelete={mockOnDelete}
        onReact={mockOnReact}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.getByText("👍")).toBeInTheDocument();
    expect(screen.getByText("❤️")).toBeInTheDocument();
    expect(screen.getByText("😂")).toBeInTheDocument();
    expect(screen.getByText("😡")).toBeInTheDocument();
    expect(screen.getByText("🎉")).toBeInTheDocument();
  });

  it("should call onReact when a reaction button is clicked", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: { name: "JaneDoe" } });

    render(
      <Post
        post={mockPost}
        onDelete={mockOnDelete}
        onReact={mockOnReact}
        onEdit={mockOnEdit}
      />,
    );

    fireEvent.click(screen.getByText("👍"));
    expect(mockOnReact).toHaveBeenCalledWith("1", "👍");
  });

  it("should render Edit and Delete buttons for the post author", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: { name: "JohnDoe" } });

    render(
      <Post
        post={mockPost}
        onDelete={mockOnDelete}
        onReact={mockOnReact}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should not render Edit and Delete buttons for non-authors", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: { name: "JaneDoe" } });

    render(
      <Post
        post={mockPost}
        onDelete={mockOnDelete}
        onReact={mockOnReact}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("should call onDelete when Delete button is clicked and confirmed", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: { name: "JohnDoe" } });
    window.confirm = vi.fn(() => true); // Mock confirm to return true

    render(
      <Post
        post={mockPost}
        onDelete={mockOnDelete}
        onReact={mockOnReact}
        onEdit={mockOnEdit}
      />,
    );

    fireEvent.click(screen.getByText("Delete"));
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this post?",
    );
    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  it("should not call onDelete when Delete button is clicked but not confirmed", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: { name: "JohnDoe" } });
    window.confirm = vi.fn(() => false); // Mock confirm to return false

    render(
      <Post
        post={mockPost}
        onDelete={mockOnDelete}
        onReact={mockOnReact}
        onEdit={mockOnEdit}
      />,
    );

    fireEvent.click(screen.getByText("Delete"));
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this post?",
    );
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("should navigate to the edit page when Edit button is clicked", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: { name: "JohnDoe" } });

    render(
      <Post
        post={mockPost}
        onDelete={mockOnDelete}
        onReact={mockOnReact}
        onEdit={mockOnEdit}
      />,
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(mockNavigate).toHaveBeenCalledWith(`/edit-post/1`, {
      state: { post: mockPost },
    });
  });

  it("should navigate to the comments page when Comments button is clicked", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: null });

    render(
      <Post
        post={mockPost}
        onDelete={mockOnDelete}
        onReact={mockOnReact}
        onEdit={mockOnEdit}
      />,
    );

    fireEvent.click(screen.getByText("Comments"));
    expect(mockNavigate).toHaveBeenCalledWith(`/post/1`);
  });
});
