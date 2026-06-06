import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import AppDialog from "./components/AppDialog";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppDialog />
    <App />
  </StrictMode>
);
