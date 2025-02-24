import React, { createContext, useState } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [userData, setUserData] = useState(null); // Track user data

  // Function to handle login
  const login = (data) => {
    setIsLoggedIn(true);
    setUserData(data); // Set user data when logging in
  };

  // Function to handle logout
  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null); // Clear user data when logging out
    // Clear the access token cookie or local storage if needed
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  return (
    <LoginContext.Provider value={{ isLoggedIn, userData, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
};
