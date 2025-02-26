import React, { useEffect, useState } from "react";
import { PostForm } from "../components/PostForm";
import { fetchJSON } from "../utils/json";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/navBar";

export const PostPage = () => {
  const [userProvider, setUserProvider] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userInfo = await fetchJSON("/api/login");
        if (userInfo && userInfo.email) {
          setUserProvider(userInfo.provider);
        } else {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false); // Set loading to false after the check is complete
      }
    };

    checkLoginStatus();
  }, [navigate]);

  if (loading) {
    return <div className="loading-message">Loading...</div>; // Show a loading message while checking
  }

  if (userProvider !== "github") {
    return (
      <div>
        <p>Access Denied. Only GitHub users can create posts.</p>
        <Link to="/">Go back to the homepage</Link>
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
