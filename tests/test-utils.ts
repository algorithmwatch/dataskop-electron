import path from "path";

import { ElectronApplication, _electron as electron } from "@playwright/test";

const beforeAll = async () => {
  const electronApp = await electron.launch({
    args: [
      path.join(__dirname, "..", "release", "app", "dist", "main", "main.js"),
    ],
  });
  const page = await electronApp.firstWindow();
  // Direct Electron console to Node terminal.
  page.on("console", console.log);

  // Mock API calls
  await page.route("**/api/campaigns/", async (route) => {
    const json = [
      {
        id: 5,
        title: "google-takeout default",
        slug: "google-takeout-default",
        description: "only for development",
        scraping_config: {
          provider: "google-takeout-youtube",
          navigation: "default",
          version: 1,
          steps: [
            {
              type: "scraping",
              slug: "gtyt-scraping-watched-videos",
              maxVideos: 1000,
              maxScraping: 500,
            },
          ],
          demoData: [],
        },
        image: null,
        provider: {
          name: "Google Takeout YouTube",
          client: "DataSkop Electron app",
        },
        accept_new_donations: true,
        featured: false,
      },
      {
        id: 4,
        title: "TikTok Development",
        slug: "tiktok-development",
        description: "TikTok Development",
        scraping_config: {
          steps: [
            { slug: "tt-data-export", type: "action" },
            {
              slug: "tt-scrape-watched-videos",
              type: "scraping",
              maxVideos: 1000,
              maxScraping: 500,
              minWatchedSeconds: 5,
            },
          ],
          version: 1,
          demoData: [],
          provider: "tiktok",
          navigation: "tt-default",
        },
        image: null,
        provider: { name: "TikTok", client: "DataSkop Electron app" },
        accept_new_donations: true,
        featured: true,
      },
      {
        id: 1,
        title: "YouTube Pilot Extreme Testing",
        slug: "test-cam",
        description: "Hier ein Test auf Staging",
        scraping_config: {
          slug: "youtube-2021-07-13-19-42-9",
          steps: [
            { slug: "yt-deactivate-watch-history", type: "action" },
            {
              type: "profile",
              profileScrapers: [
                "yt-user-watch-history",
                "yt-playlist-page-liked-videos",
                "yt-user-subscribed-channels",
              ],
            },
            {
              type: "video",
              doLogout: false,
              followVideos: 7,
              seedVideosFixed: [
                "4Y1lZQsyuSQ",
                "0WcZ8PwZvGQ",
                "a_NpJU12_LA",
                "kQ_NA1MUbIc",
                "2weZNQ1xmdE",
                "4-vuJeH6TWQ",
              ],
              seedVideosRepeat: [],
              seedVideosDynamic: [],
            },
            {
              type: "video",
              doLogout: false,
              followVideos: 0,
              seedVideosFixed: [],
              seedVideosRepeat: [],
              seedVideosDynamic: [
                {
                  slug: "yt-playlist-page-national-news-top-stories",
                  maxVideos: 5,
                },
              ],
            },
            {
              type: "search",
              queries: [
                "Baerbock",
                "Laschet",
                "Scholz",
                "Bundestagswahl 2021 wen wählen",
                "Impfpflicht",
                "Benzinpreis",
                "Gendern",
              ],
            },
            { slug: "yt-activate-watch-history", type: "action" },
            {
              type: "video",
              doLogout: true,
              followVideos: 0,
              seedVideosFixed: [],
              seedVideosRepeat: [
                {
                  step: null,
                  previousResult: "yt-playlist-page-national-news-top-stories",
                },
              ],
              seedVideosDynamic: [],
            },
            {
              type: "search",
              queries: [
                "Baerbock",
                "Laschet",
                "Scholz",
                "Bundestagswahl 2021 wen wählen",
                "Impfpflicht",
                "Benzinpreis",
                "Gendern",
              ],
            },
          ],
          title: "youtube-2021-07-13-19-42-9",
          version: 1,
          demoData: [{ data: "yt-default-demo", title: "default YT demo" }],
          provider: "youtube",
          navigation: "yt-default",
        },
        image: null,
        provider: { name: "YouTube", client: "DataSkop Electron app" },
        accept_new_donations: true,
        featured: false,
      },
    ];
    await route.fulfill({ json });
  });

  return { electronApp, page };
};

const closeApp = async (electronApp: ElectronApplication) => {
  if (process.platform === "darwin") {
    // Close window first on MacOS
    const window = await electronApp.firstWindow();
    await window.close();
  }

  return electronApp.close();
};

export { beforeAll, closeApp };
