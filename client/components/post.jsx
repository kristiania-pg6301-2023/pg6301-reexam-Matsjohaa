import React from "react";
import { useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../utils/loginProvider";

export const Post = ({ post, onDelete, onReact, onEdit }) => {
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUser();

  const handleEditClick = () => {
    navigate(`/edit-post/${post._id}`, { state: { post } });
  };

  const handleDeleteClick = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );
    if (confirmDelete) {
      onDelete(post._id);
    }
  };

  return (
    <div className="post-container">
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
          <button onClick={() => onReact(post._id, "👍")}>👍</button>
          <button onClick={() => onReact(post._id, "❤️")}>❤️</button>
          <button onClick={() => onReact(post._id, "😂")}>😂</button>
          <button onClick={() => onReact(post._id, "😡")}>😡</button>
          <button onClick={() => onReact(post._id, "🎉")}>🎉</button>
        </div>
      )}
      {loggedInUser && loggedInUser.name === post.author && (
        <div>
          <button onClick={handleEditClick}>Edit</button>
          <button onClick={handleDeleteClick}>Delete</button>
        </div>
      )}

      {/* Comment Button */}
      <button
        className="comment-button"
        onClick={() => navigate(`/post/${post._id}`)}
      >
        Comments
      </button>
    </div>
  );
};
