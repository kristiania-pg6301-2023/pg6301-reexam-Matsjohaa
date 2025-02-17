import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FrontPage } from "./pages/frontPage";
import { Login } from "./pages/loginPage";
import { LoginCallBack } from "./pages/loginCallBack";
import { Profile } from "./pages/profilePage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<FrontPage />} />
        <Route path={"/login"} element={<Login />} />
        <Route path={"/login/callback"} element={<LoginCallBack />} />
        <Route path={"/profile"} element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
