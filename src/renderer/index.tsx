import { createRoot } from "react-dom/client";
import App from "./App";

const openModal = (error) =>
  window.electron.ipc.invoke(
    "show-renderer-error-modal",
    error.message,
    error.stack,
  );

window.addEventListener("error", (event) => {
  event.preventDefault?.();
  openModal(event.error || event);
});

window.addEventListener("unhandledrejection", (event) => {
  event.preventDefault?.();

  const handleRejection = (reason) => {
    const error =
      reason instanceof Error ? reason : new Error(JSON.stringify(reason));
    throw error;
  };

  handleRejection(event.reason || event);
});

const container = document.getElementById("root");

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(<App />);
