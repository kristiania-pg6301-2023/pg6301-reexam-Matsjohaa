import React, { useState, useEffect } from "react";

export const PostForm = () => {
  const [title, setTitle] = useState("");
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
        setLoggedInUser(userInfo.name || userInfo.email); // Use 'name' or 'email' as the identifier
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
      console.log(
        "Sending request to /api/posts with title:",
        title,
        "and content:",
        content,
      );

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, username: loggedInUser }), // Include title in the request
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create post");

      const data = await response.json();
      console.log("Post created successfully:", data);
      alert("Post created successfully!");
      setTitle("");
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
