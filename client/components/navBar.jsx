import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchJSON } from "../utils/json";

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProvider, setUserProvider] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userInfo = await fetchJSON("/api/login");
        if (userInfo && userInfo.email) {
          setIsLoggedIn(true);
          setUserProvider(userInfo.provider);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUserProvider(null);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/login", {
        method: "DELETE",
      });

      // Clear user data from local storage
      localStorage.removeItem("userData");

      // Update state
      setIsLoggedIn(false);
      setUserProvider(null);

      // Redirect to home page
      navigate("/");
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      {isLoggedIn ? (
        <>
          {userProvider === "github" && <Link to="/post">Post</Link>}
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};
