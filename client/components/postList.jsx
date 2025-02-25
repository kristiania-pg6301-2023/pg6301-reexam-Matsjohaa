import React, { useEffect, useState } from "react";
import { checkLoggedInUser } from "../utils/loginProvider"; // Assuming this function correctly retrieves user info

export const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Fetch posts and check if the user is logged in
  useEffect(() => {
    fetchPosts();
    checkLoggedInUser(); // Updates loggedInUser state
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

  // Update logged-in user information
  const checkLoggedInUser = async () => {
    try {
      const response = await fetch("/api/login", {
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const userInfo = await response.json();
      setLoggedInUser(userInfo.name || userInfo.login); // Use the username or login (for GitHub)
    } catch (err) {
      console.error("Failed to fetch logged-in user:", err);
      setLoggedInUser(null); // Set to null if there's an error or no user is logged in
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
          username: loggedInUser, // Pass the logged-in username
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to react to post");
      }

      const data = await response.json();
      console.log("Reaction added:", data);
      alert("Reaction added!");
    } catch (err) {
      console.error("Failed to react to post:", err);
      alert("Failed to react to post. Please try again.");
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
          <h3>{post.title}</h3> {/* Display the title */}
          <p>{post.content}</p>
          <p>
            <strong>Author:</strong> {post.author}
          </p>
          <p>
            <strong>Reactions:</strong> {post.reactions.join(" ")}
          </p>
          {/* Reaction buttons for logged-in users */}
          {loggedInUser && (
            <div>
              <button onClick={() => handleReact(post._id, "👍")}>👍</button>
              <button onClick={() => handleReact(post._id, "❤️")}>❤️</button>
              <button onClick={() => handleReact(post._id, "😂")}>😂</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
