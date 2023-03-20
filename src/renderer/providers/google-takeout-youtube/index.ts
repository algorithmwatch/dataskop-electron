import { ProviderInformation } from "../types";
import { confirmCockieForm } from "../youtube/lib/actions/confirm-cookies";
import { gtYtNavigation } from "./lib/navigation";
import { scrapingProcedure } from "./lib/scraping-procedure";

const googleTakeoutYoutubeInfo: ProviderInformation = {
  startUrl: "https://www.youtube.com",
  loginUrl: "https://www.youtube.com/account",
  loginCookie: "LOGIN_INFO",
  persistScrapingBrowser: false,
  disableInputAfterLogin: true,
  navigation: gtYtNavigation,
  demoData: {},
  confirmCookies: confirmCockieForm,
  deserializeMapping: { scraping: scrapingProcedure },
};

export * from "./lib/config";
export { googleTakeoutYoutubeInfo };
