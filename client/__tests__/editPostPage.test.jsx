import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditPostPage } from "../pages/editPostPage";
import { useLocation, useNavigate } from "react-router-dom";
import { usePostActions } from "../utils/usePostActions";
import { useLoggedInUser } from "../utils/loginProvider";

// Mock the hooks
vi.mock("react-router-dom", () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock("../utils/usePostActions", () => ({
  usePostActions: vi.fn(),
}));

vi.mock("../utils/loginProvider", () => ({
  useLoggedInUser: vi.fn(),
}));

describe("EditPostPage Component", () => {
  // Define mock data and functions
  const mockPost = {
    _id: "post123",
    title: "Original Title",
    content: "Original Content",
  };

  const mockNavigate = vi.fn();
  const mockHandleEdit = vi.fn().mockResolvedValue({});
  const mockLoggedInUser = { name: "testuser", id: "user123" };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock returns
    useLocation.mockReturnValue({
      state: { post: mockPost },
    });
    useNavigate.mockReturnValue(mockNavigate);
    useLoggedInUser.mockReturnValue({ loggedInUser: mockLoggedInUser });
    usePostActions.mockReturnValue({ handleEdit: mockHandleEdit });
  });

  it("should render the edit form with pre-populated data", () => {
    render(<EditPostPage />);

    // Check page title
    expect(screen.getByText("Edit Post")).toBeInTheDocument();

    // Check if form fields are pre-populated with the original post data
    // Use getByDisplayValue instead of getByLabelText since labels aren't properly associated
    const titleInput = screen.getByDisplayValue("Original Title");
    const contentTextarea = screen.getByDisplayValue("Original Content");

    expect(titleInput).toBeInTheDocument();
    expect(contentTextarea).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("should update form state when inputs change", () => {
    render(<EditPostPage />);

    const titleInput = screen.getByDisplayValue("Original Title");
    const contentTextarea = screen.getByDisplayValue("Original Content");

    // Change input values
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    fireEvent.change(contentTextarea, { target: { value: "Updated Content" } });

    // Verify input values were updated
    expect(screen.getByDisplayValue("Updated Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Updated Content")).toBeInTheDocument();
  });

  it("should initialize usePostActions with null and loggedInUser", () => {
    render(<EditPostPage />);

    expect(usePostActions).toHaveBeenCalledWith(null, mockLoggedInUser);
  });

  it("should handle errors if location.state is missing", () => {
    // Mock location without state
    useLocation.mockReturnValue({});

    // Expect the component to throw an error when rendering
    expect(() => render(<EditPostPage />)).toThrow();
  });

  it("should handle errors if post is missing from location.state", () => {
    // Mock location with empty state
    useLocation.mockReturnValue({ state: {} });

    // Expect the component to throw an error when rendering
    expect(() => render(<EditPostPage />)).toThrow();
  });

  it("should maintain form state during component re-renders", () => {
    const { rerender } = render(<EditPostPage />);

    const titleInput = screen.getByDisplayValue("Original Title");
    const contentTextarea = screen.getByDisplayValue("Original Content");

    // Change input values
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    fireEvent.change(contentTextarea, { target: { value: "Updated Content" } });

    // Re-render the component
    rerender(<EditPostPage />);

    // Verify form values are maintained after re-render
    expect(screen.getByDisplayValue("Updated Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Updated Content")).toBeInTheDocument();
  });
});
