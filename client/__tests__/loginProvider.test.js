import { renderHook, waitFor } from "@testing-library/react";
import { useLoggedInUser } from "../utils/loginProvider";
import { describe, it, expect, vi } from "vitest";

describe("useLoggedInUser", () => {
  it("should return logged-in user data", async () => {
    const mockUser = { name: "John Doe", email: "john@example.com" };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      }),
    );

    const { result } = renderHook(() => useLoggedInUser());

    await waitFor(() => expect(result.current.loadingUser).toBe(false));
    expect(result.current.loggedInUser).toEqual(mockUser);
  });

  it("should handle fetch error", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    );

    const { result } = renderHook(() => useLoggedInUser());

    await waitFor(() => expect(result.current.loadingUser).toBe(false));
    expect(result.current.loggedInUser).toBeNull();
  });
});
