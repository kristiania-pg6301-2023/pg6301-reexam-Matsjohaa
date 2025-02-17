import React, {useEffect, useState} from "react";
import {fetchJSON} from "../utils/json";
import googleSignInImage from '../images/google-signin.png';

export const Login = () => {
    const [redirectUrl, setRedirectUrl] = useState();
    useEffect(async() =>{
        const {authorization_endpoint}= await fetchJSON("https://accounts.google.com/.well-known/openid-configuration")
        const parameters ={
            response_type: "token",
            client_id: "494415980966-r96j0jtg0mdtv6g4f2epi4ou6agb2om9.apps.googleusercontent.com",
            scope:"email profile",
            redirect_uri: window.location.origin + "login/callback",
        };

        setRedirectUrl(authorization_endpoint + "?" + new URLSearchParams(parameters)
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