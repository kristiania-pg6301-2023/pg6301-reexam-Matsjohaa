import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePostActions } from "../utils/usePostActions";
import { useLoggedInUser } from "../utils/loginProvider";

export const EditPostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { post } = location.state;
  const { loggedInUser } = useLoggedInUser();
  const { handleEdit } = usePostActions(null, loggedInUser);

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleEdit(post._id, { title, content });
    navigate("/");
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
