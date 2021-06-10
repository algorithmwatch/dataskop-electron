import { ScrapingResult } from '../../db/types';

type GetCurrentHtml = () => Promise<string>;

type GetHtmlFunction = (url: string) => Promise<GetCurrentHtml>;

type GetHtmlLazyFunction = (
  url: string,
  scrollBottom: number,
  loadingDone: (html: string) => boolean,
  loadingAbort: (html: string) => boolean,
) => Promise<string>;

type SeedCreator = {
  maxVideos: number;
  slug: string;
};

type SeedVideoRepeat = {
  step: number;
  previousResult: string;
  maxVideos: number;
};

type ProfileScraper = (getHtml: GetHtmlFunction) => Promise<ScrapingResult>;

type SeedVideo = {
  id: string;
  creator: string;
};

type VideoProcedureConfig = {
  type: 'videos';
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

type ProfileProcedureConfig = {
  type: 'profile';
  profileScrapers: Array<ProfileScraper>;
};

type SearchProcedureConfig = {
  type: 'search';
  queries: string[];
};

type ProcedureConfig =
  | VideoProcedureConfig
  | ProfileProcedureConfig
  | SearchProcedureConfig;

type ScrapingConfig = {
  // a human readable description of the config
  title: string;
  // the slug should be unique for a config
  slug: string;
  startUrl: string;
  loginUrl: string;
  loginCookie: string;
  steps: ProcedureConfig[];
};

export {
  GetCurrentHtml,
  GetHtmlFunction,
  GetHtmlLazyFunction,
  SeedCreator,
  ProcedureConfig,
  ScrapingConfig,
  VideoProcedureConfig,
  ProfileProcedureConfig,
  SeedVideo,
  SeedVideoRepeat,
  SearchProcedureConfig,
};
