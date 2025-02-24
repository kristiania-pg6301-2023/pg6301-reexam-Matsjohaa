import React, { useState, useEffect } from "react";

export const PostForm = () => {
  const [content, setContent] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const response = await fetch("/api/login", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userInfo = await response.json();
        setLoggedInUser(userInfo.username);
      } catch (err) {
        console.error("Failed to fetch logged-in user:", err);
        setLoggedInUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    checkLoggedInUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (content.length < 10 || content.length > 1000) {
      alert("Post content must be between 10 and 1000 characters.");
      return;
    }

    if (!loggedInUser) {
      alert("You must be logged in to create a post.");
      return;
    }

    try {
      console.log("Sending request to /api/posts with content:", content);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, username: loggedInUser }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create post");

      const data = await response.json();
      console.log("Post created successfully:", data);
      alert("Post created successfully!");
      setContent("");
      window.location.reload();
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  if (loadingUser) {
    return <div>Loading user...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <a>"2helloo"</a>
      <p>fadf</p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post (10-1000 characters)"
      />
      <button type="submit">heya</button>
    </form>
  );
};
