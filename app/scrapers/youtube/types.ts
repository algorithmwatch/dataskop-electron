type ScrapingResult = {
  task: string;
  result: any;
  error?: boolean;
  stack?: string;
};

type GetHtmlFunction = (url: string) => Promise<string>;
type GetHtmlLazyFunction = (
  url: string,
  scrollBottom: number,
  loadingDone: (html: string) => boolean,
  loadingAbort: (html: string) => boolean
) => Promise<string>;
