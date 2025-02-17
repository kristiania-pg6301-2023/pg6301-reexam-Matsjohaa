export async function fetchJSON(url, options) {
  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Failed to load, ${res.status} ${res.statusText}`);
  }

  return await res.json();
}
