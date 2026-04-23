import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App";
import GraphContextProvider from "./components/GraphContext";

createRoot(document.getElementById("root")!).render(
  <GraphContextProvider>
    <App />
  </GraphContextProvider>,
);
