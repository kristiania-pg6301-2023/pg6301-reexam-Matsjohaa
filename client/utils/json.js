export const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Ensure this line is present
  });
  if (!response.ok) {
    throw new Error(`Failed to load ${url} ${response.statusText}`);
  }
  return await response.json();
};
