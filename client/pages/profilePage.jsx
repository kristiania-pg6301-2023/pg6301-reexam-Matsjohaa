import React, { useState, useEffect } from "react";
import { fetchJSON } from "../utils/json";
import { Link } from "react-router-dom";
import { Navbar } from "../components/navBar";

export const Profile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const userInfo = await fetchJSON("/api/login");
        setData(userInfo);
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
    </div>
  );
};
