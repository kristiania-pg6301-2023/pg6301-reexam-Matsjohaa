import { useNavigate } from "react-router-dom";
import { Post } from "../components/Post";
import { usePostActions } from "../utils/usePostActions";
import { Navbar } from "../components/navBar";
import { useEffect, useState } from "react";
import { fetchJSON } from "../utils/json";

export const Profile = () => {
  const navigate = useNavigate();
  const { posts, handleReact, handleDelete } = usePostActions();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const userInfo = await fetchJSON("/api/login");
        setUser(userInfo);
      } catch (err) {
        setError(`Failed to load profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <div>Please wait...</div>;
  if (error) return <div>Error! {error}</div>;
  if (!user || !user.name || !user.email) {
    return <div>Error: Invalid user data</div>;
  }

  return (
    <div>
      <Navbar />
      <h1>
        Profile for {user.name} ({user.email})
      </h1>
      <div>
        <img src={user.picture} alt="Profile" />
      </div>

      <h2>Your Posts</h2>
      {posts.length > 0 ? (
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
      ) : (
        <p>You haven't created any posts yet.</p>
      )}
    </div>
  );
};
