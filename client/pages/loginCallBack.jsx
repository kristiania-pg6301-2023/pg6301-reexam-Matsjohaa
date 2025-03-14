import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const LoginCallBack = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function handleLogin() {
      try {
        const { code } = Object.fromEntries(
          new URLSearchParams(window.location.search),
        );

        if (code) {
          const res = await fetch("/api/login/github", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });

          if (res.ok) {
            navigate("/");
          } else {
            setError(`Failed to login: ${res.status} ${res.statusText}`);
          }
        } else {
          const { access_token } = Object.fromEntries(
            new URLSearchParams(window.location.hash.substring(1)),
          );

          if (!access_token) {
            throw new Error("No access token found");
          }

          const res = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ access_token }),
          });

          if (res.ok) {
            navigate("/");
          } else {
            setError(`Failed to login: ${res.status} ${res.statusText}`);
          }
        }
      } catch (err) {
        setError(err.message);
      }
    }

    handleLogin();
  }, [navigate]);

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <div>{error}</div>
        <Link to="/">Front page</Link>
      </div>
    );
  }

  return <h1>Please wait...</h1>;
};
