import React, { useEffect, useState } from "react";
import { fetchJSON } from "../utils/json";
import "../css/postList.css";

export const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await fetchJSON("/api/posts");
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <div key={post._id} className="post-card">
          <h3>{post.author}</h3>
          <p>{post.content}</p>
          <div className="reactions">
            {post.reactions.map((reaction, index) => (
              <span key={index}>{reaction.emoji}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
