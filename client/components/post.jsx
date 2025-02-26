import React from "react";
import { useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../utils/loginProvider";

export const Post = ({ post, onDelete, onReact }) => {
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUser();

  return (
    <div
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
          <button onClick={() => onReact(post._id, "👍")}>👍</button>
          <button onClick={() => onReact(post._id, "❤️")}>❤️</button>
          <button onClick={() => onReact(post._id, "😂")}>😂</button>
          <button onClick={() => onReact(post._id, "😡")}>😡</button>
          <button onClick={() => onReact(post._id, "🎉")}>🎉</button>
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
          <button onClick={() => onDelete(post._id)}>Delete</button>
        </div>
      )}
    </div>
  );
};
