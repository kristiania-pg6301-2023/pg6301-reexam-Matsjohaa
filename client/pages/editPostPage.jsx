import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePostActions } from "../utils/usePostActions";

export const EditPostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { post } = location.state; // Get the post from the route state
  const { handleEdit } = usePostActions();

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleEdit(post._id, { title, content });
    navigate("/"); // Navigate back to the home page after editing
  };

  return (
    <div>
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
