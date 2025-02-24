// PostPage.js
import React, { useEffect, useState } from "react";
import { PostForm } from "../components/PostForm";
import { fetchJSON } from "../utils/json";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/navBar";

export const PostPage = () => {
  const [userProvider, setUserProvider] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userInfo = await fetchJSON("/api/login");
        if (userInfo && userInfo.email) {
          setUserProvider(userInfo.provider); // Set the user's provider
        } else {
          navigate("/login"); // Redirect to login if not authenticated
        }
      } catch (err) {
        navigate("/login"); // Redirect to login if there's an error
      }
    };

    checkLoginStatus();
  }, [navigate]);

  if (userProvider !== "github") {
    return (
      <div>
        <p>Access Denied. Only GitHub users can create posts.</p>
        <Link to="/">Go back to the homepage</Link> {/* Link to homepage */}
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <h1>Create a New Post</h1>
      <PostForm />
    </div>
  );
};
