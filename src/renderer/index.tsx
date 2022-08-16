import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");

// container is unavailable for testing
if (container !== null) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = createRoot(container!);
  root.render(<App />);
}
