import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLoggedInUser } from "../utils/loginProvider";

export const EditPostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { post } = location.state || {}; // Get the post data from the state
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const { loggedInUser } = useLoggedInUser(); // Use the custom hook

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
      alert("You must be logged in to edit a post.");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          username: loggedInUser, // Pass the logged-in user
        }),
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
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
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
