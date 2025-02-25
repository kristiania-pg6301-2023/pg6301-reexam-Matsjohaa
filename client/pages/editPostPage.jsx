import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../components/navBar";

export const EditPostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { post } = location.state || {}; // Get the post data from the state

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Title and content are required.");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      alert("Post updated successfully!");
      navigate("/"); // Redirect to the home page after editing
    } catch (err) {
      console.error("Failed to update post:", err);
      alert("Failed to update post. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Edit Post</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
