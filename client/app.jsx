import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Correct import
import { FrontPage } from "./pages/frontPage";

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<FrontPage />} />
            </Routes>
        </BrowserRouter>
    );
}