import {
  ElectronApplication,
  expect,
  Page,
  test,
  _electron as electron,
} from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe.serial(() => {
  let page: Page;
  let electronApp: ElectronApplication;
  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: [
        path.join(__dirname, "..", "release", "app", "dist", "main", "main.js"),
      ],
    });
    page = await electronApp.firstWindow();
    // Direct Electron console to Node terminal.
    page.on("console", console.log);
  });

  test.afterAll(async () => {
    if (process.platform === "darwin") {
      // Close window first on MacOS
      const window = await electronApp.firstWindow();
      await window.close();
    }

    await electronApp.close();
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
      (await page.locator("#debug-logging div").textContent())?.trim() ===
      "Debug logging: no"
    ) {
      await page.click("#debug-logging button");
    }

    if (
      (await page.locator("#html-logging div").textContent())?.trim() ===
      "HTML logging: no"
    ) {
      await page.click("#html-logging button");
    }

    // open menu again
    await page.locator("button").first().click();
    await page.waitForTimeout(1000);

    await page.click("text=TikTok routes");
    await page.click("text=/.tiktok.start/");
    await page.keyboard.down("Escape");

    await page.keyboard.down("Escape");
    await page.waitForTimeout(1000);

    await page.click("text=Start");
    await page.click("text=weiter");
    await page.click("text=Überspringen");
    await page.click("text=Ich habe die DSGVO-Daten bereits");

    await page.waitForTimeout(1000);

    console.log(process.env.DUMP_PATH);

    await page.locator("#playwright-workaround").fill(process.env.DUMP_PATH);

    await expect(page.locator("text=das hat geklappt")).toBeVisible();
    await page.locator("button", { hasText: "weiter" }).click();

    // Import done. Now scrape.
    await expect(page.locator("text=Die Daten sind da")).toBeVisible({
      timeout: 60 * 60 * 1000 * 2,
    });

    // Scrape done. Now show viz.
    await page.click("text=weiter");

    const exportDir =
      process.env.EXPORT_PATH +
      "/" +
      new Date().getTime() +
      "_" +
      path.parse(process.env.DUMP_PATH).name;

    if (!fs.existsSync(process.env.EXPORT_PATH))
      fs.mkdirSync(process.env.EXPORT_PATH);

    fs.mkdirSync(exportDir);

    // Viz 1

    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `${exportDir}/viz1.png`,
    });

    await page.locator("text=Als Bild speichern").click();
    await page.waitForTimeout(1000);
    fs.renameSync("DataSkop_TikTok_Viz_1.jpg", `${exportDir}/viz1_export.jpg`);

    await page.click("text=weiter");

    // Viz 2
    await page.waitForTimeout(5000);
    await page.screenshot({
      path: `${exportDir}/viz2_1.png`,
    });

    page.locator("text=Als Bild speichern").click();
    await page.waitForTimeout(1000);
    fs.renameSync(
      "DataSkop_TikTok_Viz_2.jpg",
      `${exportDir}/viz2_1_export.jpg`,
    );

    // Click on other tab
    await page.locator("a", { hasText: "Kategorien" }).click();

    await page.waitForTimeout(5000);
    await page.screenshot({
      path: `${exportDir}/viz2_2.png`,
    });

    page.locator("text=Als Bild speichern").click();
    await page.waitForTimeout(1000);
    fs.renameSync(
      "DataSkop_TikTok_Viz_2.jpg",
      `${exportDir}/viz2_1_export.jpg`,
    );

    await page.click("text=weiter");

    // Viz 3

    await page.waitForTimeout(5000);

    await page.screenshot({
      path: `${exportDir}/viz3.png`,
    });

    page.locator("text=Als Bild speichern").click();
    await page.waitForTimeout(5000);
    fs.renameSync("DataSkop_TikTok_Viz_3.jpg", `${exportDir}/viz3_export.jpg`);

    await page.click("text=weiter");

    // Donate? No.

    await page.click("text=Nein");

    // Newsletter? No.
    await page.click("text=Nein");

    await expect(page.locator("text=Danke für deine Teilnahme")).toBeVisible();

    await page.locator("text=hier").click();
    await page.waitForTimeout(5000);

    const exportFile = fs
      .readdirSync(".")
      .filter(
        (fn) => fn.includes("dataskop-tiktok-2022") && fn.endsWith(".json"),
      )[0];

    fs.renameSync(exportFile, `${exportDir}/export_dump.json`);
  });
});