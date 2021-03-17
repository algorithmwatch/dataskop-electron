interface ScrapingResult {
  task: string;
  result: any;
  errorMessage?: string;
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
