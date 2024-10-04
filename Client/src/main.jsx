import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Video from "./Video.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <Video />
  </StrictMode>
);
