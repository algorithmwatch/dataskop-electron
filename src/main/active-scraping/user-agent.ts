// Choosing a correct user agent is important to make the login with Google.
// 1) Using the Electron default one will fail.
// 2) Choosing the user agent of the bundled chrome version will also fail.
// It seems that Google knows that this is a modified version of the chrome (fingerprinting?)
// 3) So we set to some recent Firefox user agents. This used to work from mid 2021 to Jan. 2022.
// 4) Now we use a recent Vivaldi user agent.

// Background:
// https://stackoverflow.com/a/68231284/4028896
// https://www.reddit.com/r/kde/comments/e7136e/google_bans_falkon_and_konqueror_browsers/faicv9g/
// https://www.electronjs.org/releases/stable?version=12&page=3#12.0.0
// https://www.whatismybrowser.com/guides/the-latest-user-agent/

const getUserAgent = (platform: string) => {
  let userAgent = "Mozilla/5.0";
  if (platform === "darwin" || platform === "win32" || platform === "linux")
    userAgent = {
      darwin:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3",
      win32:
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3",
      linux:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Vivaldi/4.3",
    }[platform];

  return userAgent;
};

export { getUserAgent };
