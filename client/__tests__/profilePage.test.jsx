import { render, screen, waitFor } from "@testing-library/react";
import { Profile } from "../pages/profilePage";
import { useLoggedInUser } from "../utils/loginProvider";
import { fetchJSON } from "../utils/json";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("../utils/loginProvider", () => ({
  useLoggedInUser: vi.fn(),
}));

vi.mock("../utils/json", () => ({
  fetchJSON: vi.fn(),
}));

describe("Profile", () => {
  it("should render loading state initially", () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: null, loadingUser: true });
    fetchJSON.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("should handle invalid user data", async () => {
    useLoggedInUser.mockReturnValue({ loggedInUser: null, loadingUser: false });
    fetchJSON.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Error: Invalid user data")).toBeInTheDocument(),
    );
  });
});
