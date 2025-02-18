import React, { useContext, useEffect, useState } from "react";
import { fetchJSON } from "../utils/json";
import googleSignInImage from "../images/google-signin.png";
import { LoginContext } from "../app";
import { Link } from "react-router-dom";

export const Login = () => {
  const { discovery_endpoint, client_id, response_type } =
    useContext(LoginContext);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Tracks if user is logged in
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await fetchJSON("/api/login"); // Check if user is logged in
        if (user && user.email) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    const getAuthUrl = async () => {
      try {
        const { authorization_endpoint } = await fetchJSON(discovery_endpoint);
        const parameters = {
          response_type,
          client_id,
          scope: "email profile",
          redirect_uri: window.location.origin + "/login/callback",
        };
        setRedirectUrl(
          authorization_endpoint + "?" + new URLSearchParams(parameters),
        );
      } catch (err) {
        setError("Failed to load authentication details.");
      }
    };

    checkLoginStatus();
    getAuthUrl();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <Link to="/">Home</Link>
        <h1>You are already logged in!</h1>
        <p>
          Please <Link to="/profile">visit your profile</Link> or{" "}
          <a
            href="#"
            onClick={() =>
              fetch("/api/login", { method: "DELETE" }).then(() =>
                window.location.reload(),
              )
            }
          >
            logout
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/">Home</Link>
      <h1>Welcome to the Login Page!</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <a href={redirectUrl}>
          <img src={googleSignInImage} alt="Sign in with Google" />
        </a>
      )}
    </div>
  );
};
