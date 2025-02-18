import React, { useContext, useEffect, useState } from "react";
import { fetchJSON } from "../utils/json";
import googleSignInImage from "../images/google-signin.png";
import { LoginContext } from "../app";

export const Login = () => {
  const { discovery_endpoint, client_id, response_type } =
    useContext(LoginContext);
  const [redirectUrl, setRedirectUrl] = useState();
  useEffect(async () => {
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
  }, []);

  return (
    <div>
      <h1>Welcome to the login Page!</h1>
      <a href={redirectUrl}>
        <img src={googleSignInImage} alt="Sign in with Google" />
      </a>
    </div>
  );
};
