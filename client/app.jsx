import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FrontPage } from "./pages/frontPage";
import { Login } from "./pages/loginPage";
import { LoginCallBack } from "./pages/loginCallBack";
import { Profile } from "./pages/profilePage";
import { useLoader } from "./utils/hooks";
import { fetchJSON } from "./utils/json";
import { PostPage } from "./pages/postPage";
import { EditPostPage } from "./pages/editPostPage";
import { PostDetails } from "./pages/postDetails";

export const LoginContext = React.createContext({});
//
export function App() {
  const { loading, error, data } = useLoader(() =>
    fetchJSON("/api/login/config"),
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.toString()}</div>;

  return (
    <LoginContext.Provider value={data}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/callback" element={<LoginCallBack />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post" element={<PostPage />} />
          <Route path="/edit-post/:postId" element={<EditPostPage />} />
          <Route path="/post/:postId" element={<PostDetails />} />
        </Routes>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}
