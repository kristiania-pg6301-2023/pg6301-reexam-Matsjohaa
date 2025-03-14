import React, { useState } from "react";
import { useLoggedInUser } from "../utils/loginProvider";
import { useNavigate } from "react-router-dom";

export const PostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { loggedInUser, loadingUser } = useLoggedInUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate title and content
    if (!title || title.length < 5 || title.length > 100) {
      alert("Title must be between 5 and 100 characters.");
      return;
    }

    if (!content || content.length < 10 || content.length > 1000) {
      alert("Post content must be between 10 and 1000 characters.");
      return;
    }

    if (!loggedInUser) {
      alert("You must be logged in to create a post.");
      return;
    }

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          username: loggedInUser.name,
        }),
        credentials: "include",
      });

      if (response.status === 429) {
        alert("You can only create 5 posts per hour.");
        return;
      }

      if (!response.ok) throw new Error("Failed to create post");

      const data = await response.json();
      console.log("Post created successfully:", data);
      alert("Post created successfully!");
      setTitle("");
      setContent("");

      navigate("/");
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  if (loadingUser) {
    return <div className="loading-message">Loading user...</div>;
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter post title (5-100 characters)"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post content (10-1000 characters)"
      />
      <button type="submit">Post</button>
    </form>
  );
};
