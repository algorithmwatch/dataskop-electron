import { currentDelay } from "renderer/lib/delay";

const confirmCookies = async () => {
  await currentDelay("longer");
  window.electron.log.info("Checking for cookie banner");
  const exists = await window.electron.ipc.invoke(
    "scraping-element-exists",
    "tiktok-cookie-banner",
    "button:nth-of-type(2)",
  );
  if (exists) {
    window.electron.log.info("Cookie banner is present, accepting terms");
    await window.electron.ipc.invoke(
      "scraping-click-element",
      "tiktok-cookie-banner",
      0,
      "button:nth-of-type(2)",
    );
  } else {
    window.electron.log.info("Cookie banner not present");
  }
};

export { confirmCookies };
