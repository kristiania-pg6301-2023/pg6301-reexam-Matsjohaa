// components/PostForm.js
import React, { useState } from "react";
import Cookies from "js-cookie"; // Import js-cookie

export const PostForm = () => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.length < 10 || content.length > 1000) {
      alert("Post content must be between 10 and 1000 characters.");
      return;
    }

    try {
      const accessToken = Cookies.get("access_token"); // Retrieve the access token from cookies

      console.log("Sending request to /api/posts with content:", content);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Include the access token in the headers
        },
        body: JSON.stringify({ content }),
        credentials: "include", // Send cookies if needed
      });

      console.log(response);

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

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post (10-1000 characters)"
        required
      />
      <button type="submit">Post</button>
    </form>
  );
};
