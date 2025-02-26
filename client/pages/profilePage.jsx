import React, { useState, useEffect } from "react";
import { fetchJSON } from "../utils/json";
import { Link } from "react-router-dom";
import { Navbar } from "../components/navBar";

export const Profile = () => {
  const [data, setData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const userInfo = await fetchJSON("/api/login");
        setData(userInfo);

        // Fetch posts created by the user
        const posts = await fetchJSON(`/api/posts/user/${userInfo.name}`);
        setUserPosts(posts);
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

  if (!data || !data.name || !data.email) {
    return <div>Error: Invalid user data</div>;
  }

  return (
    <div>
      <Navbar />
      <h1>
        Profile for {data.name} ({data.email})
      </h1>
      <div>
        <img src={data.picture} alt="Profile" />
      </div>

      <h2>Your Posts</h2>
      {userPosts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {userPosts.map((post) => (
            <div
              key={post._id}
              style={{
                border: "1px solid #ccc",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <p>
                <strong>Reactions:</strong> {post.reactions.join(" ")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't created any posts yet.</p>
      )}
    </div>
  );
};
