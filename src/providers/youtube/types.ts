import { ScrapingConfig } from '../types';

export type GetCurrentHtml = () => Promise<string>;

export type GetHtmlFunction = (url: string) => Promise<GetCurrentHtml>;

export type GetHtmlLazyFunction = (
  url: string,
  scrollBottom: number,
  loadingDone: (html: string) => boolean,
  loadingAbort: (html: string) => boolean,
) => Promise<string>;

export type SeedCreator = {
  maxVideos: number;
  slug: string;
};

export type SeedVideoRepeat = {
  step: number | null;
  previousResult: string;
};

export type ProfileScraper =
  | 'yt-user-watch-history'
  | 'yt-playlist-page-liked-videos'
  | 'yt-user-search-history'
  | 'yt-user-subscribed-channels';

export type SeedScraper =
  | 'yt-playlist-page-popular-videos'
  | 'yt-playlist-page-national-news-top-stories';

export type SeedVideo = {
  id: string;
  creator: SeedScraper | 'fixed' | string;
};

export type ActionProcedureConfig = {
  type: 'action';
  slug: 'yt-activate-watch-history' | 'yt-deactivate-watch-history';
};

export type VideoProcedureConfig = {
  type: 'video';
  // id of videos that are further processed
  seedVideosFixed: Array<string>;
  // function that provides seed videos, including the approx. amount of videos (for the progress bar)
  seedVideosDynamic: Array<SeedCreator>;
  // scrape some previous results again
  seedVideosRepeat: Array<SeedVideoRepeat>;
  // how many videos to follow for each seed video
  followVideos: number;
  // how often to scroll down for lazy loading
  scrollingBottomForComments: number;
  // if true, logout user before first scraping
  doLogout: boolean;
};

export type ProfileProcedureConfig = {
  type: 'profile';
  profileScrapers: Array<ProfileScraper>;
};

export type SearchProcedureConfig = {
  type: 'search';
  queries: string[];
};

export type YtProcedureConfig =
  | ActionProcedureConfig
  | ProfileProcedureConfig
  | VideoProcedureConfig
  | SearchProcedureConfig;

// need to export it here directly to make it work with JSON scheme creation
export interface YtScrapingConfig extends ScrapingConfig {
  version: 1;
  provider: 'youtube';
  steps: YtProcedureConfig[];
}
