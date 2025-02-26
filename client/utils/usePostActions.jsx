// utils/usePostActions.js
import { useState, useEffect } from "react";
import { fetchJSON } from "./json";

export const usePostActions = (username) => {
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
    try {
      await fetchJSON(`/api/posts/${postId}/react`, {
        method: "POST",
        body: JSON.stringify({ emoji, username }),
      });
      // Update local state to reflect the reaction
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                reactions: [
                  ...post.reactions.filter(
                    (r) => !r.startsWith(`${username}:`),
                  ),
                  `${username}:${emoji}`,
                ],
              }
            : post,
        ),
      );
    } catch (err) {
      console.error("Failed to react to post:", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await fetchJSON(`/api/posts/${postId}`, {
        method: "DELETE",
        body: JSON.stringify({ username }),
      });
      // Remove the deleted post from local state
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleEdit = async (postId, updatedPost) => {
    try {
      await fetchJSON(`/api/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ ...updatedPost, username }),
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
