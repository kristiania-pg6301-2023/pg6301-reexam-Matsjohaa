import { useState, useEffect } from "react";

export const useLoggedInUser = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const response = await fetch("/api/login", {
          credentials: "include", // Ensure cookies are sent
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userInfo = await response.json();
        setLoggedInUser(userInfo); // Store the full user object
      } catch (err) {
        console.error("Failed to fetch logged-in user:", err);
        setLoggedInUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    checkLoggedInUser();
  }, []);

  return { loggedInUser, loadingUser };
};
