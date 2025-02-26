import { useNavigate } from "react-router-dom";
import { Post } from "../components/Post";
import { usePostActions } from "../utils/usePostActions"; // Import the shared logic

export const PostList = () => {
  const navigate = useNavigate();
  const { posts, handleReact, handleDelete } = usePostActions(); // Use the shared logic

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
      }}
    >
      {posts.map((post) => (
        <Post
          key={post._id}
          post={post}
          onDelete={handleDelete}
          onReact={handleReact}
        />
      ))}
    </div>
  );
};
