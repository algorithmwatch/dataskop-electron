import { ProviderInformation } from "../types";
import { confirmCookies } from "./lib/actions";
import { ttNavigation } from "./lib/navigation";
import { deserializeMapping } from "./lib/procedures";

const tiktokInfo: ProviderInformation = {
  startUrl: "https://www.tiktok.com",
  loginUrl: "https://www.tiktok.com/login/",
  loginCookie: "cmpl_token",
  persistScrapingBrowser: true,
  disableInputAfterLogin: false,
  navigation: ttNavigation,
  confirmCookies,
  deserializeMapping,
};

export * from "./lib";
export { tiktokInfo };
