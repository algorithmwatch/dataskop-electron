import { NavigationState } from "renderer/contexts/types";

const ytDefaultNav: NavigationState = {
  pageIndex: 0,
  pages: [
    {
      path: "/youtube/start",
      sectionKey: null,
    },
    {
      path: "/youtube/intro",
      sectionKey: null,
    },
    {
      path: "/youtube/onboarding1",
      sectionKey: null,
    },
    {
      path: "/youtube/onboarding2",
      sectionKey: null,
    },
    {
      path: "/youtube/interface-tutorial",
      sectionKey: "/youtube/interface-tutorial",
    },
    {
      path: "/youtube/scraping-explanation",
      sectionKey: "/youtube/scraping-explanation",
    },
    {
      path: "/youtube/visualization/profile",
      sectionKey: "/youtube/visualization/profile",
    },
    {
      path: "/youtube/research-info",
      sectionKey: "/youtube/research-info",
    },
    {
      path: "/youtube/visualization/autoplay-chain",
      sectionKey: "/youtube/visualization/autoplay-chain",
    },
    {
      path: "/youtube/visualization/news",
      sectionKey: "/youtube/visualization/news",
    },
    {
      path: "/youtube/visualization/search",
      sectionKey: "/youtube/visualization/search",
    },
    {
      path: "/youtube/my-data",
      sectionKey: "/youtube/my-data",
    },
    {
      path: "/youtube/questionnaire",
      sectionKey: "/youtube/questionnaire",
    },
    {
      path: "/youtube/donation1",
      sectionKey: "/youtube/donation1",
    },
    {
      path: "/youtube/donation2",
      sectionKey: null,
    },
    {
      path: "/youtube/donation-success",
      sectionKey: "/youtube/donation-success",
    },
  ],
  sections: {
    "/youtube/interface-tutorial": { label: "Die Benutzeroberfläche" },
    "/youtube/scraping-explanation": {
      label: "Wie funktioniert Scraping?",
    },
    "/youtube/visualization/profile": { label: "Mein YouTube-Profil" },
    "/youtube/research-info": { label: "Was wir untersuchen" },
    "/youtube/visualization/autoplay-chain": { label: "AutoPlay Viz" },
    "/youtube/visualization/news": { label: "News Viz" },
    "/youtube/visualization/search": { label: "Search Viz" },
    "/youtube/my-data": { label: "Meine Daten" },
    "/youtube/questionnaire": { label: "Umfrage" },
    "/youtube/donation1": { label: "Die Datenspende" },
    "/youtube/donation-success": { label: "Ende" },
  },
};

const ytEduDemoNav = {
  pageIndex: 0,
  pages: [
    {
      path: "/youtube/start",
      sectionKey: null,
    },
    {
      path: "/youtube/scraping-explanation",
      sectionKey: "/youtube/scraping-explanation",
    },
    {
      path: "/youtube/visualization/profile",
      sectionKey: "/youtube/visualization/profile",
    },
    {
      path: "/youtube/visualization/autoplay-chain",
      sectionKey: "/youtube/visualization/autoplay-chain",
    },
    {
      path: "/youtube/visualization/news",
      sectionKey: "/youtube/visualization/news",
    },
    {
      path: "/youtube/visualization/news",
      sectionKey: "/youtube/visualization/news",
    },
    {
      path: "/youtube/visualization/search",
      sectionKey: "/youtube/visualization/search",
    },
  ],
  sections: {
    "/youtube/scraping-explanation": {
      label: "Wie funktioniert Scraping?",
    },
    "/youtube/visualization/profile": { label: "Mein YouTube-Profil" },
    "/youtube/visualization/autoplay-chain": { label: "AutoPlay Viz" },
    "/youtube/visualization/news": { label: "News Viz" },
    "/youtube/visualization/search": { label: "Search Viz" },
    "/youtube/visualization/my-data": { label: "Meine Daten" },
  },
};

const ytNavigation = {
  "yt-default": ytDefaultNav,
  "yt-education-demo": ytEduDemoNav,
};

export { ytNavigation };
