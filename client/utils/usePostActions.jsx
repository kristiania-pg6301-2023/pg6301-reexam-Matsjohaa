import { useState, useEffect } from "react";
import { useLoggedInUser } from "../utils/loginProvider";

export const usePostActions = () => {
  const [posts, setPosts] = useState([]);
  const { loggedInUser } = useLoggedInUser();

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const handleReact = async (postId, emoji) => {
    if (!loggedInUser) {
      alert("You must be logged in to react to posts.");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emoji,
          username: loggedInUser,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to react to post");
      }

      fetchPosts(); // Refresh the posts after reacting
      alert("Reaction updated!");
    } catch (err) {
      console.error("Failed to react to post:", err);
      alert("Failed to react to post. Please try again.");
    }
  };

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );
    if (!confirmDelete) return;

    if (!loggedInUser) {
      alert("You must be logged in to delete a post.");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: loggedInUser }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      fetchPosts(); // Refresh the posts after deletion
      alert("Post deleted successfully!");
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  return {
    posts,
    handleReact,
    handleDelete,
  };
};
