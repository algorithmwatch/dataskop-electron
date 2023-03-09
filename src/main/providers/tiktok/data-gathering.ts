import { elementExists } from "../../active-scraping/inject";

const postloadTiktok = async (
  view: Electron.CrossProcessExports.BrowserView,
) => {
  if (await elementExists(view, "#loginContainer")) {
    view.webContents.insertCSS(
      "#loginContainer > div > div > div { display: none }",
    );
  }
};

export { postloadTiktok };
