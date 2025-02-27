export async function fetchJSON(url, options = { method: "GET" }) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Failed ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    // Catch any fetch errors (network failure, etc.)
    throw new Error(`Network Error: ${error.message}`);
  }
}
