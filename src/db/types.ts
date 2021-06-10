import { ParserResult } from '@algorithmwatch/harke-parser/src/types';

// re-defining the slug of `ParserResult` from `harke-parser` because the slug is not changable
interface ScrapingResult extends Omit<ParserResult, 'slug'> {
  slug: string;
  success: boolean;
}

interface ScrapingResultSaved extends ScrapingResult {
  sessionId: string;
  scrapedAt: number; // number of millisecconds in UTC
}

interface ScrapingSessions {
  sessionId: string;
  startedAt: number; // number of millisecconds in UTC
  configSlug: string;
}

export { ScrapingResult, ScrapingResultSaved, ScrapingSessions };
