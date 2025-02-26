// utils/usePostActions.js
import { useState, useEffect } from "react";
import { fetchJSON } from "./json";

export const usePostActions = (username, loggedInUser) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch all posts if no username is provided
        const endpoint = username
          ? `/api/posts/user/${username}`
          : "/api/posts";
        const fetchedPosts = await fetchJSON(endpoint);
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchPosts();
  }, [username]); // Re-fetch when username changes

  const handleReact = async (postId, emoji) => {
    if (!loggedInUser) {
      alert("You must be logged in to react to a post."); // Alert for logged-out users
      return;
    }

    try {
      await fetchJSON(`/api/posts/${postId}/react`, {
        method: "POST",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji, username: loggedInUser.name }), // Use loggedInUser.name
      });

      // Update local state to reflect the reaction
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                reactions: [
                  ...post.reactions.filter(
                    (r) => !r.startsWith(`${loggedInUser.name}:`),
                  ),
                  `${loggedInUser.name}:${emoji}`,
                ],
              }
            : post,
        ),
      );

      alert(`You reacted with ${emoji}!`); // Alert for successful reaction
    } catch (err) {
      console.error("Failed to react to post:", err);
      alert("Failed to react to the post. Please try again."); // Alert for errors
    }
  };

  const handleDelete = async (postId) => {
    if (!loggedInUser) {
      alert("You must be logged in to delete a post."); // Alert for logged-out users
      return;
    }

    try {
      await fetchJSON(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: loggedInUser.name }), // Use loggedInUser.name
      });

      // Remove the deleted post from local state
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));

      alert("Post deleted successfully!"); // Alert for successful deletion
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete the post. Please try again."); // Alert for errors
    }
  };

  const handleEdit = async (postId, updatedPost) => {
    if (!loggedInUser) {
      console.error("User not logged in");
      return;
    }

    try {
      await fetchJSON(`/api/posts/${postId}`, {
        method: "PUT",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updatedPost, username: loggedInUser.name }), // Use loggedInUser.name
      });
      // Update local state to reflect the edited post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, ...updatedPost } : post,
        ),
      );
    } catch (err) {
      console.error("Failed to edit post:", err);
    }
  };

  return { posts, handleReact, handleDelete, handleEdit };
};
