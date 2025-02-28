import React, { useContext, useEffect, useState } from "react";
import { fetchJSON } from "../utils/json";
import googleSignInImage from "../images/google-signin.png";
import githubSignInImage from "../images/github-signin.png"; // Add a GitHub sign-in image
import { LoginContext } from "../app";
import { Link } from "react-router-dom";
import { Navbar } from "../components/navBar";

export const Login = () => {
  const {
    google_client_id,
    google_discovery_endpoint,
    github_client_id,
    response_type,
  } = useContext(LoginContext);
  const [googleRedirectUrl, setGoogleRedirectUrl] = useState(null);
  const [githubRedirectUrl, setGithubRedirectUrl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await fetchJSON("/api/login");
        if (user && user.email) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    const getAuthUrls = async () => {
      try {
        // Google OAuth URL
        const { authorization_endpoint } = await fetchJSON(
          google_discovery_endpoint,
        );
        const googleParameters = {
          response_type,
          client_id: google_client_id,
          scope: "email profile",
          redirect_uri: window.location.origin + "/login/callback",
        };
        setGoogleRedirectUrl(
          authorization_endpoint + "?" + new URLSearchParams(googleParameters),
        );

        // GitHub OAuth URL
        const githubParameters = {
          client_id: github_client_id,
          redirect_uri: window.location.origin + "/login/callback",
          scope: "user",
        };
        setGithubRedirectUrl(
          `https://github.com/login/oauth/authorize?${new URLSearchParams(githubParameters)}`,
        );
      } catch (err) {
        setError("Failed to load authentication details.");
      }
    };

    checkLoginStatus();
    getAuthUrls();
  }, []);

  if (isAuthenticated === null) {
    return <div className="login-message">Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="login-container">
        <Link to="/" className="login-link">
          Home
        </Link>
        <h1 className="login-header">You are already logged in!</h1>
        <p className="login-message">
          Please{" "}
          <Link to="/profile" className="login-link">
            visit your profile
          </Link>{" "}
          or{" "}
          <a
            href="#"
            className="login-link"
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
    <div className="login-container">
      <Navbar />

      <h1 className="login-header">Welcome to the Login Page!</h1>
      {error ? (
        <p className="login-error">{error}</p>
      ) : (
        <div className="login-buttons">
          <a href={googleRedirectUrl}>
            <img src={googleSignInImage} alt="Sign in with Google" />
          </a>
          <a href={githubRedirectUrl}>
            <img src={githubSignInImage} alt="Sign in with GitHub" />
          </a>
        </div>
      )}
    </div>
  );
};
