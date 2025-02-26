import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../utils/loginProvider";
import { Navbar } from "../components/navBar";

const fetchPostDetails = async (postId) => {
  const response = await fetch(`/api/posts/${postId}/comments`);
  if (!response.ok) throw new Error("Failed to fetch post details");
  return response.json();
};

const addComment = async (comment) => {
  const response = await fetch(`/api/posts/${comment.postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
};

export const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUser();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const postData = await fetchPostDetails(postId);
      setPost(postData.post);
      setComments(postData.comments);
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
      postId,
      author: loggedInUser.name,
      content: newComment,
      createdAt: new Date(),
    };

    await addComment(comment);
    setComments([...comments, comment]);
    setNewComment("");
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
      {comments.map((comment, index) => (
        <div
          key={index}
          style={{ borderBottom: "1px solid #ccc", padding: "8px 0" }}
        >
          <p>
            <strong>{comment.author}</strong> -{" "}
            {new Date(comment.createdAt).toLocaleString()}
          </p>
          <p>{comment.content}</p>
        </div>
      ))}

      {loggedInUser?.provider === "github" && (
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={{ width: "100%", marginTop: "16px" }}
          />
          <button onClick={handleAddComment}>Submit Comment</button>
        </div>
      )}
    </div>
  );
};
