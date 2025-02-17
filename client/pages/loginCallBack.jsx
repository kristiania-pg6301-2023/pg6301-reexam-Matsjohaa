import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const LoginCallBack = () => {
  const navigate = useNavigate();
  useEffect(async () => {
    const { access_token } = Object.fromEntries(
      new URLSearchParams(window.location.hash.substring(1)),
    );

    await fetch("api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ access_token }),
    });
  }, []);

  navigate("/");
};
