export const checkLoggedInUser = async () => {
  try {
    const response = await fetch("/api/login", {
      credentials: "include", // Include cookies in the request
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userInfo = await response.json();
    return userInfo.email; // Assuming the user info contains an email field
  } catch (err) {
    console.error("Failed to fetch logged-in user:", err);
    return null; // Return null if there's an error or no user is logged in
  }
};
