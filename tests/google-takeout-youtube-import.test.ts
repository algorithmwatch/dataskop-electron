import { ElectronApplication, expect, Page, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { beforeAll, closeApp } from "./test-utils";

test.describe.serial(() => {
  let page: Page;
  let electronApp: ElectronApplication;

  test.beforeAll(async () => {
    const res = await beforeAll();
    electronApp = res.electronApp;
    page = res.page;
  });

  test.afterAll(async () => {
    return closeApp(electronApp);
  });

  test("Import dump, scrape, show viz, export", async () => {
    // Set some long timeout for scraping
    test.setTimeout(60 * 60 * 1000 * 2);

    // Evaluation expression in the Electron context.
    const appPath = await electronApp.evaluate(async ({ app }) => {
      // This runs in the main Electron process, parameter here is always
      // the result of the require('electron') in the main app script.
      return app.getAppPath();
    });
    console.log(appPath);

    if (!process.env.DUMP_PATH) throw new Error("Env for dump not set!");
    if (!process.env.EXPORT_PATH) throw new Error("Env for export not set!");

    await expect(page).toHaveTitle("DataSkop");

    await page.locator("button").first().click();
    await page.waitForTimeout(1000);

    // Click four times until advanced menu appears
    await page.click("div >> text=/Version: \\d+.\\d+.\\d+/");
    await page.click("div >> text=/Version: \\d+.\\d+.\\d+/");
    await page.click("div >> text=/Version: \\d+.\\d+.\\d+/");
    await page.click("div >> text=/Version: \\d+.\\d+.\\d+/");

    await page.click("text=Advanced");
    await page.click("text=Clear results and sessions");
    await page.click("text=Settings");

    await page.waitForTimeout(1000);
    if (
      (await page.locator("div", { hasText: "Debug logging: no" }).count()) > 0
    ) {
      await page.click("div:text('Debug') + button");
    }

    if (
      (await page.locator("div", { hasText: "HTML logging: no" }).count()) > 0
    ) {
      await page.click("div:text('HTML') + button");
    }

    // open menu again
    await page.locator("button").first().click();
    await page.waitForTimeout(1000);

    await page.click("*:text-is('Advanced')");
    await page.click("text=Start TikTok");

    await page.waitForTimeout(1000);

    await page.click("#up-logo");

    await page.click("text=weiter");

    await page.waitForTimeout(1000);

    console.log(process.env.DUMP_PATH);

    await page.locator("#playwright-workaround").fill(process.env.DUMP_PATH);

    await expect(page.locator("text=das hat geklappt")).toBeVisible();
    await page.locator("button", { hasText: "weiter" }).click();

    const exportDir = `${process.env.EXPORT_PATH}/${new Date().getTime()}_${
      path.parse(process.env.DUMP_PATH).name
    }`;

    if (!fs.existsSync(process.env.EXPORT_PATH))
      fs.mkdirSync(process.env.EXPORT_PATH);

    fs.mkdirSync(exportDir);

    // Viz 1
    await page.click("text=Schließen", {
      timeout: 60 * 60 * 1000 * 2,
    });
    await page.screenshot({
      path: `${exportDir}/viz1.png`,
    });

    // await page.locator("text=Als Bild speichern").click();
    // fs.renameSync(
    //   "DataSkop_TikTok_Viz_1_default.jpg",
    //   `${exportDir}/viz1_export.jpg`,
    // );

    await page.click("text=weiter");

    // Viz 2
    await page.click("text=Schließen");
    await page.screenshot({
      path: `${exportDir}/viz2_1.png`,
    });

    // page.locator("text=Als Bild speichern").click();
    // await page.waitForTimeout(1000);
    // fs.renameSync(
    //   "DataSkop_TikTok_Viz_2.jpg",
    //   `${exportDir}/viz2_1_export.jpg`,
    // );

    // Click on other tab
    await page.locator("button", { hasText: "Kategorien" }).click();

    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${exportDir}/viz2_2.png`,
    });

    // page.locator("text=Als Bild speichern").click();
    // await page.waitForTimeout(1000);
    // fs.renameSync(
    //   "DataSkop_TikTok_Viz_2.jpg",
    //   `${exportDir}/viz2_1_export.jpg`,
    // );

    await page.click("text=weiter");

    // // Viz 3
    // await page.click("text=Schließen");

    // await page.screenshot({
    //   path: `${exportDir}/viz3.png`,
    // });

    // page.locator("text=Als Bild speichern").click();
    // await page.waitForTimeout(1000);
    // fs.renameSync("DataSkop_TikTok_Viz_3.jpg", `${exportDir}/viz3_export.jpg`);

    // await page.click("text=weiter");

    // // Donate? No.

    // await page.click("text=Nein");

    // // Newsletter? No.
    // await page.click("text=Nein");

    // await expect(page.locator("text=Danke für deine Teilnahme")).toBeVisible();

    await page.locator("text=hier").click();
    await page.waitForTimeout(1000);

    const exportFile = fs
      .readdirSync(".")
      .filter(
        (fn) =>
          fn.includes("dataskop-google-takeout-youtube") &&
          fn.endsWith(".json"),
      )[0];

    fs.renameSync(exportFile, `${exportDir}/export_dump.json`);
  });
});
