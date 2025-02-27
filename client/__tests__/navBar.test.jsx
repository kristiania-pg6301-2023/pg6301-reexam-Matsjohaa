import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { fetchJSON } from "../utils/json";

// Mock navigate from react-router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock fetchJSON
vi.mock("../utils/json", () => ({
  fetchJSON: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  document.body.innerHTML = "<div id='root'></div>";
});

describe("Navbar Component", () => {
  it("renders login link when user is logged out", async () => {
    fetchJSON.mockRejectedValue(new Error("Not logged in"));

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("renders profile and logout links when user is logged in", async () => {
    fetchJSON.mockResolvedValue({
      email: "test@example.com",
      provider: "google",
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("renders Post link only for GitHub users", async () => {
    fetchJSON.mockResolvedValue({
      email: "test@example.com",
      provider: "github",
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Post")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("logs out the user when Logout is clicked", async () => {
    fetchJSON.mockResolvedValue({
      email: "test@example.com",
      provider: "google",
    });

    // Mock fetch for logout request
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Logout")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/login", {
      method: "DELETE",
    });
    expect(localStorage.getItem("userData")).toBeNull();
  });

  it("handles logout API failure gracefully", async () => {
    fetchJSON.mockResolvedValue({
      email: "test@example.com",
      provider: "google",
    });

    global.fetch = vi.fn().mockRejectedValue(new Error("Logout failed"));

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Logout")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument(); // Still logged in due to error
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/login", {
      method: "DELETE",
    });
  });
});
