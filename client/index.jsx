import React from "react";
import ReactDOM from "react-dom/client"; // Import from "react-dom/client"
import { App } from "./app";

import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById("app"))

root.render(<App />);