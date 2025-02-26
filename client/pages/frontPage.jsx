import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/navBar";
import { Post } from "../components/Post";
import { usePostActions } from "../utils/usePostActions";
import { useLoggedInUser } from "../utils/loginProvider";

export const FrontPage = () => {
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUser();
  const { posts, handleReact, handleDelete } = usePostActions(
    null,
    loggedInUser,
  );

  return (
    <>
      <Navbar />
      <h1>Welcome to the Front Page!</h1>
      <div className="posts-grid">
        {posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            onDelete={handleDelete}
            onReact={handleReact}
          />
        ))}
      </div>
    </>
  );
};
