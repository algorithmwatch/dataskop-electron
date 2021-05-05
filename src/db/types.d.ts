// not re-using the `ParserResult` from `harke-parser` because the slug is not changable
export interface ScrapingResult {
  slug: string;
  fields: {
    [key: string]: any;
  };
  errors: Array<{ field: string; message: string }>;
  success: boolean;
}

interface ScrapingResultSaved extends ScrapingResult {
  id?: number;
  sessionId: string;
  scrapedAt: number; // number of millisecconds in UTC
}

interface ScrapingSessions {
  id?: number;
  sessionId: string;
  startedAt: number; // number of millisecconds in UTC
}
