import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/navBar";
import { PostList } from "../components/postList";

export const FrontPage = () => {
  return (
    <>
      <Navbar />
      <h1>Welcome to the Front Page!</h1>
      <PostList />
    </>
  );
};
