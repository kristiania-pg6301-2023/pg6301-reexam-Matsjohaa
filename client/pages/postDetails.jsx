import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../utils/loginProvider";
import { Navbar } from "../components/navBar";

const fetchPostDetails = async (postId) => {
  const response = await fetch(`/api/posts/${postId}`);
  if (!response.ok) throw new Error("Failed to fetch post details");
  return response.json();
};

const addComment = async (postId, comment) => {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(comment),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
};

const deleteComment = async (postId, commentId, username) => {
  const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username }),
  });
  if (!response.ok) throw new Error("Failed to delete comment");
  return response.json();
};

export const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUser();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postData = await fetchPostDetails(postId);
        setPost(postData);
      } catch (err) {
        console.error("Error fetching post details:", err);
      }
    };
    fetchData();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    if (loggedInUser?.provider !== "github") {
      alert("Only GitHub users can comment.");
      return;
    }

    const comment = {
      author: loggedInUser.name,
      content: newComment,
      provider: loggedInUser.provider,
      createdAt: new Date(),
    };

    try {
      const response = await addComment(postId, comment);
      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, response],
      }));
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!loggedInUser)
      return alert("You must be logged in to delete a comment");

    try {
      await deleteComment(postId, commentId, loggedInUser.name);
      setPost((prevPost) => ({
        ...prevPost,
        comments: prevPost.comments.filter(
          (comment) => comment._id !== commentId,
        ),
      }));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment.");
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div style={{ padding: "16px" }}>
      <Navbar />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>
        <strong>Author:</strong> {post.author}
      </p>
      <p>
        <strong>Reactions:</strong> {post.reactions.join(" ")}
      </p>

      <h2>Comments</h2>

      {loggedInUser?.provider === "github" && (
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={{ width: "100%", marginBottom: "16px" }}
          />
          <button onClick={handleAddComment}>Submit Comment</button>
        </div>
      )}

      {post.comments.map((comment) => (
        <div
          key={comment._id}
          style={{ borderBottom: "1px solid #ccc", padding: "8px 0" }}
        >
          <p>
            <strong>{comment.author}</strong> -{" "}
            {new Date(comment.createdAt).toLocaleString()}
          </p>
          <p>{comment.content}</p>
          {loggedInUser?.name === comment.author && (
            <button
              onClick={() => handleDeleteComment(comment._id)}
              style={{ color: "red" }}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
