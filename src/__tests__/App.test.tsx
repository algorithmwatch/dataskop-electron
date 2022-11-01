import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import App from "../renderer/App";

describe("App", () => {
  it("should render", () => {
    window.electron = {};
    window.electron.log = {};
    window.electron.log.error = () => console.log("mock log error");
    window.electron.log.info = () => console.log("mock log info");
    window.electron.ipc = {};
    window.electron.ipc.invoke = () => console.log("mock invoke");
    window.electron.ipc.on = () => console.log("mock on");
    window.electron.ipc.removeAllListeners = () =>
      console.log("mock removeAllListeners");
    window.electron.ipc.removeListener = () =>
      console.log("mock removeListener");
    expect(render(<App />)).toBeTruthy();
  });
});
