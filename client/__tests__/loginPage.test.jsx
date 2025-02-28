import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Login } from "../pages/loginPage.jsx";
import { LoginContext } from "../app";
import { fetchJSON } from "../utils/json";
import { Link } from "react-router-dom";
import { Navbar } from "../components/navBar";

// Mock dependencies
vi.mock("../utils/json", () => ({
  fetchJSON: vi.fn(),
}));

vi.mock("../components/navBar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

describe("Login Component", () => {
  const mockLoginContext = {
    google_client_id: "google-client-id",
    google_discovery_endpoint: "https://google-discovery-endpoint",
    github_client_id: "github-client-id",
    response_type: "code",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state when authentication status is null", () => {
    fetchJSON.mockResolvedValueOnce(null); // Simulate loading state
    render(
      <LoginContext.Provider value={mockLoginContext}>
        <Login />
      </LoginContext.Provider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders authenticated state when user is logged in", async () => {
    fetchJSON.mockResolvedValueOnce({ email: "test@example.com" }); // Simulate authenticated user
    render(
      <LoginContext.Provider value={mockLoginContext}>
        <Login />
      </LoginContext.Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("You are already logged in!"),
      ).toBeInTheDocument();
      expect(screen.getByText("visit your profile")).toBeInTheDocument();
      expect(screen.getByText("logout")).toBeInTheDocument();
    });
  });

  test("renders login buttons when user is not authenticated", async () => {
    fetchJSON.mockResolvedValueOnce(null); // Simulate unauthenticated user
    fetchJSON.mockResolvedValueOnce({
      authorization_endpoint: "https://google-auth-endpoint",
    }); // Simulate Google OAuth URL fetch
    render(
      <LoginContext.Provider value={mockLoginContext}>
        <Login />
      </LoginContext.Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Welcome to the Login Page!"),
      ).toBeInTheDocument();
      expect(screen.getByAltText("Sign in with Google")).toBeInTheDocument();
      expect(screen.getByAltText("Sign in with GitHub")).toBeInTheDocument();
    });
  });

  test("handles errors during authentication status check", async () => {
    fetchJSON.mockRejectedValueOnce(new Error("API error")); // Simulate error
    render(
      <LoginContext.Provider value={mockLoginContext}>
        <Login />
      </LoginContext.Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Welcome to the Login Page!"),
      ).toBeInTheDocument();
    });
  });

  test("handles errors during OAuth URL fetch", async () => {
    fetchJSON.mockResolvedValueOnce(null); // Simulate unauthenticated user
    fetchJSON.mockRejectedValueOnce(new Error("Failed to fetch OAuth URLs")); // Simulate error
    render(
      <LoginContext.Provider value={mockLoginContext}>
        <Login />
      </LoginContext.Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load authentication details."),
      ).toBeInTheDocument();
    });
  });
});
