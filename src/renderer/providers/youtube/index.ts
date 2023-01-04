import { ProviderInformation } from "../types";
import { confirmCockieForm } from "./lib/actions/confirm-cookies";
import { ytNavigation } from "./lib/navigation";
import { deserializeMapping } from "./lib/procedures";
import ytDefaultDemoData from "./static/yt-default-demo.json";

const youtubeInfo: ProviderInformation = {
  startUrl: "https://www.youtube.com",
  loginUrl: "https://www.youtube.com/account",
  loginCookie: "LOGIN_INFO",
  persistScrapingBrowser: false,
  disableInputAfterLogin: true,
  navigation: ytNavigation,
  demoData: { "yt-default-demo": ytDefaultDemoData },
  confirmCookies: confirmCockieForm,
  deserializeMapping,
};

export * from "./lib";
export { youtubeInfo };
