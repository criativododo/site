import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../index.css";
import "./linha-noiva.css";
import LinhaNoiva from "./LinhaNoiva";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LinhaNoiva />
  </StrictMode>,
);
