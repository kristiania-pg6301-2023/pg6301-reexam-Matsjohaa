import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLoggedInUser } from "../utils/loginProvider";

export const PostList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const { loggedInUser } = useLoggedInUser(); // Use the custom hook

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

      const data = await response.json();
      console.log("Reaction added:", data);
      fetchPosts(); // Refresh the posts after reacting
      alert("Reaction added!");
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
        body: JSON.stringify({ username: loggedInUser }), // Send the username in the request body
        credentials: "include", // Include cookies if needed for other purposes
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
      }}
    >
      {posts.map((post) => (
        <div
          key={post._id}
          style={{
            border: "1px solid #ccc",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>
            <strong>Author:</strong> {post.author}
          </p>
          <p>
            <strong>Reactions:</strong> {post.reactions.join(" ")}
          </p>
          {loggedInUser && (
            <div>
              <button onClick={() => handleReact(post._id, "👍")}>👍</button>
              <button onClick={() => handleReact(post._id, "❤️")}>❤️</button>
              <button onClick={() => handleReact(post._id, "😂")}>😂</button>
            </div>
          )}
          {loggedInUser === post.author && (
            <div>
              <button
                onClick={() =>
                  navigate(`/edit-post/${post._id}`, { state: { post } })
                }
              >
                Edit
              </button>
              <button onClick={() => handleDelete(post._id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
