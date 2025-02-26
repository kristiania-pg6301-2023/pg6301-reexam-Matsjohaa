// FrontPage.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/navBar";
import { Post } from "../components/Post";
import { usePostActions } from "../utils/usePostActions"; // Import the shared logic

export const FrontPage = () => {
  const navigate = useNavigate();
  const { posts, handleReact, handleDelete } = usePostActions(); // Fetch all posts

  return (
    <>
      <Navbar />
      <h1>Welcome to the Front Page!</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            onDelete={handleDelete}
            onReact={handleReact}
          />
        ))}
      </div>
    </>
  );
};
