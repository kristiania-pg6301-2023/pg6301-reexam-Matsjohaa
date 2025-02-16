import React from "react";
import { App } from "./app";
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById("app"))

root.render(<App />);