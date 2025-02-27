import { useNavigate } from "react-router-dom";
import { Post } from "../components/post";
import { usePostActions } from "../utils/usePostActions";
import { Navbar } from "../components/navBar";
import { useEffect, useState } from "react";
import { fetchJSON } from "../utils/json";
import { useLoggedInUser } from "../utils/loginProvider";

export const Profile = () => {
  const navigate = useNavigate();
  const { loggedInUser } = useLoggedInUser();
  const { posts, handleReact, handleDelete, handleEdit } = usePostActions(
    loggedInUser?.name,
    loggedInUser,
  );
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
        <img className="profile-picture" src={user.picture} alt="Profile" />
      </div>

      <h2>Your Posts</h2>
      {posts.length > 0 ? (
        <div className="posts-grid">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              onDelete={handleDelete}
              onReact={handleReact}
              onEdit={(updatedPost) => handleEdit(post._id, updatedPost)}
            />
          ))}
        </div>
      ) : (
        <p>You haven't created any posts yet.</p>
      )}
    </div>
  );
};
