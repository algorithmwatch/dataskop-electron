import {
  ElectronApplication,
  expect,
  Page,
  test,
  _electron as electron,
} from "@playwright/test";
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

  test("Electron App has the correct buttons and information on the start screen", async () => {
    // Evaluation expression in the Electron context.
    const appPath = await electronApp.evaluate(async ({ app }) => {
      // This runs in the main Electron process, parameter here is always
      // the result of the require('electron') in the main app script.
      return app.getAppPath();
    });
    console.log(appPath);

    await page.locator("button").first().click();
    await page.waitForTimeout(1000);

    // Click four times until advanced menu appears
    await page.click("div >> text=/Version: \\d+.\\d+.\\d+/");
    await page.click("div >> text=/Version: \\d+.\\d+.\\d+/");
    await page.click("div >> text=/Version: \\d+.\\d+.\\d+/");
    await page.click("div >> text=/Version: \\d+.\\d+.\\d+/");

    await page.click("text=Advanced");
    await page.click("text=Clear results and sessions");
    await page.click("text=Start TikTok");
    await page.waitForTimeout(1000);

    await expect(page).toHaveTitle("DataSkop");
    await expect(page.locator("text=Start")).toBeVisible();

    await page.keyboard.down("Tab");
    await page.keyboard.down("Tab");
    await page.keyboard.down("Tab");
    await page.keyboard.down("Enter");
    await page.waitForTimeout(1000);

    await expect(page.locator("button", { hasText: "Kontakt" })).toBeVisible();
    await expect(
      page.locator("div >> text=/Version: \\d+.\\d+.\\d+/"),
    ).toBeVisible();

    await page.keyboard.down("Escape");
    await page.waitForTimeout(1000);

    await expect(page.locator("button", { hasText: "Kontakt" })).toBeHidden();
  });
});
