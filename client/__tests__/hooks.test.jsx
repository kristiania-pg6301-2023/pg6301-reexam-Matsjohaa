import { renderHook, act } from "@testing-library/react";
import { useLoader } from "../utils/hooks";
import { vi } from "vitest";

describe("useLoader", () => {
  it("should handle loading state initially", async () => {
    // Mock a fetch function that resolves after a delay
    const mockFetchFunction = vi.fn(
      () => new Promise((resolve) => setTimeout(() => resolve("data"), 100)),
    );

    const { result } = renderHook(() => useLoader(mockFetchFunction));

    // Initially, loading should be true, and data and error should be null
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for the fetch function to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // After resolution, loading should be false, and data should be set
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe("data");
    expect(result.current.error).toBeNull();
  });

  it("should handle successful data fetching", async () => {
    // Mock a fetch function that resolves immediately
    const mockFetchFunction = vi.fn().mockResolvedValueOnce("data");

    const { result } = renderHook(() => useLoader(mockFetchFunction));

    // Initially, loading should be true
    expect(result.current.loading).toBe(true);

    // Wait for the fetch function to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // After resolution, loading should be false, and data should be set
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe("data");
    expect(result.current.error).toBeNull();
  });

  it("should handle error state when fetching fails", async () => {
    // Mock a fetch function that rejects with an error
    const mockError = new Error("Failed to fetch data");
    const mockFetchFunction = vi.fn().mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useLoader(mockFetchFunction));

    // Initially, loading should be true
    expect(result.current.loading).toBe(true);

    // Wait for the fetch function to reject
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // After rejection, loading should be false, and error should be set
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it("should re-fetch data when fetchFunction changes", async () => {
    // Mock two different fetch functions
    const mockFetchFunction1 = vi.fn().mockResolvedValueOnce("data1");
    const mockFetchFunction2 = vi.fn().mockResolvedValueOnce("data2");

    const { result, rerender } = renderHook(
      ({ fetchFunction }) => useLoader(fetchFunction),
      {
        initialProps: { fetchFunction: mockFetchFunction1 },
      },
    );

    // Wait for the first fetch function to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify the first result
    expect(result.current.data).toBe("data1");

    // Change the fetch function and re-render
    rerender({ fetchFunction: mockFetchFunction2 });

    // Wait for the second fetch function to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify the second result
    expect(result.current.data).toBe("data2");
  });
});
