import { ProviderInformation } from "../types";
import { confirmCookies } from "./lib/cookies";
import { ttNavigation } from "./lib/navigation";
import { deserializeMapping } from "./lib/procedures";

const tiktokInfo: ProviderInformation = {
  startUrl: "https://www.tiktok.com",
  loginUrl: "https://www.tiktok.com/login/",
  // The token is not 100% correct. But if it's set, the user has logged in, so it's sufficient.
  loginCookie: "cmpl_token",
  // The browser needs to store session data to able to
  persistScrapingBrowser: true,
  // The user needs to able to interact with the site
  disableInputAfterLogin: false,
  navigation: ttNavigation,
  confirmCookies,
  deserializeMapping,
};

export * from "./lib";
export { tiktokInfo };
