import log from "electron-log";

const postLoadYoutube = async (
  view: Electron.CrossProcessExports.BrowserView,
) => {
  // pause videos right after rendering, import to not alter the HTML for the hash check
  try {
    await view.webContents.executeJavaScript(
      "const awThePlayer = document.querySelector('.html5-video-player'); if(awThePlayer != null) awThePlayer.click();",
    );
  } catch (e) {
    log.log(e);
  }
};
export { postLoadYoutube };
