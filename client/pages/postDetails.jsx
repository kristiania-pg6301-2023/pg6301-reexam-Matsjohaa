import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../utils/loginProvider";
import { Navbar } from "../components/navBar";

export const fetchPostDetails = async (postId) => {
  const response = await fetch(`/api/posts/${postId}`);
  if (!response.ok) throw new Error("Failed to fetch post details");
  return response.json();
};

export const addComment = async (postId, comment) => {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(comment),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
};

export const deleteComment = async (postId, commentId, username) => {
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
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postData = await fetchPostDetails(postId);
        setPost(postData);
      } catch (err) {
        console.error("Error fetching post details:", err);
      } finally {
        setLoading(false); // Set loading to false after fetching
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

  if (loading) {
    return <div className="loading-message">Loading post details...</div>; // Show loading message
  }

  if (!post) {
    return <div className="error-message">Failed to load post details.</div>; // Show error message if post is null
  }

  return (
    <div className="post-details-container">
      <Navbar />
      <h1 className="post-details-title">{post.title}</h1>
      <p className="post-details-content">{post.content}</p>
      <p className="post-details-author">
        <strong>Author:</strong> {post.author}
      </p>
      <p className="post-details-reactions">
        <strong>Reactions:</strong> {post.reactions.join(" ")}
      </p>

      <div className="comments-section">
        <h2>Comments:</h2>

        {loggedInUser?.provider === "github" && (
          <div>
            <textarea
              className="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button
              className="comment-submit-button"
              onClick={handleAddComment}
            >
              Submit Comment
            </button>
          </div>
        )}

        {post.comments.length === 0 ? (
          <p className="no-comments-message">No comments yet.</p>
        ) : (
          post.comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <p className="comment-author">
                <strong>{comment.author}</strong> -{" "}
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="comment-content">{comment.content}</p>
              {loggedInUser?.name === comment.author && (
                <button
                  className="comment-delete-button"
                  onClick={() => handleDeleteComment(comment._id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
