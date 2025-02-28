import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginCallBack } from "../pages/loginCallBack";

// Mock navigate from react-router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: actual.Link,
  };
});

// Mock fetch
global.fetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  mockNavigate.mockClear();
  delete window.location;
});

describe("LoginCallBack Component", () => {
  it("logs in successfully via GitHub code", async () => {
    window.location = { search: "?code=12345", hash: "" };
    fetch.mockResolvedValue({ ok: true });

    render(
      <MemoryRouter>
        <LoginCallBack />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Please wait...")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/login/github",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "12345" }),
      }),
    );
  });

  it("logs in successfully via OAuth access_token", async () => {
    window.location = { search: "", hash: "#access_token=abcdef" };
    fetch.mockResolvedValue({ ok: true });

    render(
      <MemoryRouter>
        <LoginCallBack />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ access_token: "abcdef" }),
      }),
    );
  });

  it("shows an error when neither code nor access_token is found", async () => {
    window.location = { search: "", hash: "" };

    render(
      <MemoryRouter>
        <LoginCallBack />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(screen.getByText("No access token found")).toBeInTheDocument();
    expect(screen.getByText("Front page")).toBeInTheDocument();
  });

  it("shows an error if the API request fails", async () => {
    window.location = { search: "?code=12345", hash: "" };
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    render(
      <MemoryRouter>
        <LoginCallBack />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to login: 401 Unauthorized"),
    ).toBeInTheDocument();
  });

  it("handles fetch throwing an error", async () => {
    window.location = { search: "?code=12345", hash: "" };
    fetch.mockRejectedValue(new Error("Network Error"));

    render(
      <MemoryRouter>
        <LoginCallBack />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });
});
