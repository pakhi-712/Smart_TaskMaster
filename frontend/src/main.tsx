import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// This is the entry point — the very first JavaScript that runs.
// It finds the <div id="root"> in index.html and renders the App component inside it.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);