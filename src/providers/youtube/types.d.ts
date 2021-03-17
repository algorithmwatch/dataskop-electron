type GetHtmlFunction = (url: string) => Promise<string>;

type GetHtmlLazyFunction = (
  url: string,
  scrollBottom: number,
  loadingDone: (html: string) => boolean,
  loadingAbort: (html: string) => boolean,
) => Promise<string>;

type SeedCreator = {
  approxNumVideos: number;
  seedFunction: (getHtml: GetHtmlFunction) => Promise<ScrapingResult>;
};

type PersonalScraper = (getHtml: GetHtmlFunction) => Promise<ScrapingResult>;

type ProcedureConfig = {
  // id of videos that are further processed
  seedFixedVideos: Array<string>;
  // function that provides seed videos, including the approx. amount of videos (for the progress bar)
  seedCreators: Array<SeedCreator>;
  // how many videos to follow for each seed video
  followVideos: number;
  // how often to scroll down for lazy loading
  scrollingBottomForComments: number;
  personalScrapers: Array<PersonalScraper>;
};
