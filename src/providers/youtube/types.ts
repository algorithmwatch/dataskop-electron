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
  getVideos: (getHtml: GetHtmlFunction) => Promise<ScrapingResult>;
};

type ProfileScraper = (getHtml: GetHtmlFunction) => Promise<ScrapingResult>;

type VideoProcedureConfig = {
  type: 'videos';
  // id of videos that are further processed
  seedVideosFixed: Array<string>;
  // function that provides seed videos, including the approx. amount of videos (for the progress bar)
  seedVideosDynamic: Array<SeedCreator>;
  // how many videos to follow for each seed video
  followVideos: number;
  // how often to scroll down for lazy loading
  scrollingBottomForComments: number;
};

type ProfileProcedureConfig = {
  type: 'profile';
  profileScrapers: Array<ProfileScraper>;
};

type ProcedureConfig = VideoProcedureConfig | ProfileProcedureConfig;

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
};
