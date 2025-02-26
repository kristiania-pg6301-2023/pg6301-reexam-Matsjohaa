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
      onDelete(post._id); // Call the onDelete function if the user confirms
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        borderRadius: "8px",
        position: "relative", // For positioning the comment button
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
          <button onClick={handleDeleteClick}>Delete</button>{" "}
          {/* Use handleDeleteClick */}
        </div>
      )}

      {/* Comment Button */}
      <button
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
        }}
        onClick={() => navigate(`/post/${post._id}`)} // Navigate to the post details page
      >
        Comments
      </button>
    </div>
  );
};
