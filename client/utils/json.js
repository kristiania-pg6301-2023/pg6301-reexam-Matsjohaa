export async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(
      `Failed to load ${response.status} ${response.statusText}: ${errorMessage}`,
    );
  }
  return response.json();
}
