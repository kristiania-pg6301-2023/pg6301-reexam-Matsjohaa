import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../app";
import { createRoot } from "react-dom/client";
import * as hooks from "../utils/hooks";
import * as jsonUtils from "../utils/json";

vi.mock("../utils/hooks", () => ({ useLoader: vi.fn() }));
vi.mock("../utils/json", () => ({ fetchJSON: vi.fn() }));

// Mock pages
vi.mock("../pages/frontPage", () => ({
  FrontPage: () => <div>FrontPage</div>,
}));
vi.mock("../pages/loginPage", () => ({ Login: () => <div>LoginPage</div> }));
vi.mock("../pages/loginCallBack", () => ({
  LoginCallBack: () => <div>LoginCallBack</div>,
}));
vi.mock("../pages/profilePage", () => ({
  Profile: () => <div>ProfilePage</div>,
}));
vi.mock("../pages/postPage", () => ({ PostPage: () => <div>PostPage</div> }));
vi.mock("../pages/editPostPage", () => ({
  EditPostPage: () => <div>EditPostPage</div>,
}));
vi.mock("../pages/postDetails", () => ({
  PostDetails: () => <div>PostDetails</div>,
}));

// App component tests
describe("App", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    hooks.useLoader.mockReturnValue({ loading: true, error: null, data: null });
    render(<App />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state if fetching fails", () => {
    hooks.useLoader.mockReturnValue({
      loading: false,
      error: new Error("Failed"),
      data: null,
    });
    render(<App />);
    expect(screen.getByText("Error: Failed")).toBeInTheDocument();
  });

  it("renders the FrontPage on default route", () => {
    hooks.useLoader.mockReturnValue({ loading: false, error: null, data: {} });
    render(<App />);
    expect(screen.getByText("FrontPage")).toBeInTheDocument();
  });
});
