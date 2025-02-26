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
          setUserProvider(userInfo.provider);
        } else {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);

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
