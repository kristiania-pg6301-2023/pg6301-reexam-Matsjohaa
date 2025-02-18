import fetch from "node-fetch";

export async function fetchJSON(url, options = { method: "GET" }) {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Failed ${res.status}`);
  }
  return await res.json();
}
